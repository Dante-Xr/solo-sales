# 后台管理系统 RBAC 权限管理完善计划

## 一、现状分析

### 已有基础
1. **数据模型**: Prisma schema 已定义 Permission, Role, AdminUser 模型
2. **认证 API**: `/api/admin/auth` 已实现登录、登出、获取当前管理员信息
3. **权限 API**: `/api/admin/permissions` 已实现 CRUD
4. **角色 API**: `/api/admin/roles` 已实现列表和创建
5. **用户 API**: `/api/admin/users` 已实现列表和创建
6. **角色管理页面**: `/admin/roles` 已有完整 UI
7. **缓存工具**: `src/lib/cache.ts` 已支持 Redis 缓存

### 缺失功能
1. **权限校验中间件**: API 请求未经过权限验证
2. **权限缓存机制**: 每次请求都查询数据库
3. **权限变更日志**: 缺少审计日志功能
4. **权限管理 UI 页面**: `/admin/permissions` 页面不存在
5. **角色/用户编辑删除**: API 只有 GET 和 POST
6. **数据权限控制**: 仅实现了功能权限，未实现数据权限
7. **动态权限生效**: 权限变更后需要重启或重新登录
8. **测试覆盖**: 缺少单元测试和集成测试

---

## 二、系统架构设计

### 2.1 权限类型
```
PAGE     - 页面权限（控制菜单可见性）
ACTION   - 操作权限（控制按钮、操作项）
DATA     - 数据权限（控制数据范围，如：只能查看自己创建的数据）
```

### 2.2 缓存策略
```
权限缓存键格式:
  admin:permissions:{adminId}  → 用户权限列表 (TTL: 5分钟)
  role:permissions:{roleId}    → 角色权限列表 (TTL: 10分钟)
  permissions:all              → 所有权限列表 (TTL: 30分钟)

缓存失效触发:
  - 用户权限变更 → 删除 admin:permissions:{adminId}
  - 角色权限变更 → 删除 admin:permissions:* (该角色下所有用户)
  - 权限本身变更 → 删除 permissions:all
```

### 2.3 日志记录
```
权限变更日志内容:
  - 操作人 (adminId)
  - 操作类型 (CREATE/UPDATE/DELETE)
  - 操作对象类型 (PERMISSION/ROLE/ADMIN_USER)
  - 操作对象 ID
  - 变更前数据 (JSON)
  - 变更后数据 (JSON)
  - IP 地址
  - 时间戳
```

---

## 三、实施任务清单

### Phase 1: 数据模型扩展
- [ ] 1.1 添加 PermissionLog 模型到 schema.prisma
  - 记录权限变更日志
- [ ] 1.2 添加 DATA 权限类型枚举值
- [ ] 1.3 运行 prisma generate 和 db push

### Phase 2: 权限校验中间件
- [ ] 2.1 创建 `src/lib/adminAuth.ts` 权限校验库
  - verifyAdminToken(token) - 验证 Token
  - getAdminPermissions(adminId) - 获取用户权限（带缓存）
  - hasPermission(adminId, permission) - 检查权限
  - invalidatePermissionCache(adminId) - 清除缓存
- [ ] 2.2 创建 API 权限校验中间件
  - requirePermission(permission) - 包装函数
  - 支持在 API 路由中使用
- [ ] 2.3 创建数据权限中间件
  - requireDataOwner() - 数据权限控制
  - 支持按创建者筛选数据

### Phase 3: 权限缓存机制
- [ ] 3.1 扩展 cache.ts 添加权限缓存键
  - CACHE_KEYS.ADMIN_PERMISSIONS
  - CACHE_KEYS.ROLE_PERMISSIONS
  - CACHE_KEYS.ALL_PERMISSIONS
- [ ] 3.2 实现权限缓存获取和设置
- [ ] 3.3 实现权限变更时缓存失效逻辑

### Phase 4: 权限变更日志
- [ ] 4.1 创建 `src/lib/permissionLog.ts` 日志记录库
  - logPermissionChange() - 记录权限变更
  - getPermissionLogs() - 获取日志列表
- [ ] 4.2 在权限 API 中集成日志记录
- [ ] 4.3 在角色 API 中集成日志记录
- [ ] 4.4 在用户 API 中集成日志记录

### Phase 5: API 完善
- [ ] 5.1 完善 `/api/admin/permissions/[id]` 路由
  - PATCH 更新权限
  - DELETE 删除权限（检查引用）
- [ ] 5.2 完善 `/api/admin/roles/[id]` 路由
  - GET 获取单个角色详情
  - PATCH 更新角色
  - DELETE 删除角色（检查用户引用）
- [ ] 5.3 完善 `/api/admin/users/[id]` 路由
  - GET 获取单个用户详情
  - PATCH 更新用户
  - DELETE 删除用户

### Phase 6: 权限管理 UI 页面
- [ ] 6.1 创建 `/admin/permissions` 页面
  - 权限列表展示
  - 创建/编辑权限 Dialog
  - 删除权限确认
- [ ] 6.2 更新侧边栏导航
  - 添加权限管理入口

### Phase 7: 动态权限生效
- [ ] 7.1 实现无感知的权限刷新机制
  - 登录时返回完整权限列表
  - 前端定期刷新权限（每5分钟）
  - 权限变更推送通知前端
- [ ] 7.2 前端权限 Hook
  - usePermissions() - 获取当前用户权限
  - hasPermission(permission) - 检查权限

### Phase 8: 测试覆盖
- [ ] 8.1 创建权限校验单元测试
- [ ] 8.2 创建 API 集成测试
- [ ] 8.3 创建缓存机制测试

---

## 四、技术实现细节

### 4.1 权限校验中间件使用示例
```typescript
// 在 API 路由中使用
import { requirePermission } from '@/lib/adminAuth'

// GET /api/admin/products
export const GET = requirePermission('products.view')(async (request, admin) => {
  // admin 是验证通过的管理员信息
  const products = await getProducts()
  return NextResponse.json({ success: true, data: products })
})
```

### 4.2 缓存失效策略
```typescript
// 角色权限变更时
async function updateRolePermissions(roleId: string, newPermissionIds: string[]) {
  // 1. 更新数据库
  await prisma.role.update({ ... })

  // 2. 清除缓存
  await cacheDel(`admin:permissions:*`) // 清除该角色下所有用户缓存

  // 3. 记录日志
  await logPermissionChange({ ... })
}
```

### 4.3 数据权限控制
```typescript
// 在查询时自动添加数据权限过滤
function addDataScopeFilter(query: Prisma.ProductWhereInput, admin: AdminInfo): Prisma.ProductWhereInput {
  if (admin.role.name === 'super_admin') return query

  // 根据数据权限决定筛选条件
  if (hasDataPermission(admin, 'products.view_own')) {
    return { ...query, createdBy: admin.id }
  }
  return query
}
```

---

## 五、文件结构

```
src/
├── app/
│   ├── admin/
│   │   ├── permissions/
│   │   │   └── page.tsx          # 权限管理页面
│   │   └── ...
│   └── api/
│       └── admin/
│           ├── permissions/
│           │   ├── route.ts       # GET, POST
│           │   └── [id]/route.ts  # PATCH, DELETE
│           ├── roles/
│           │   ├── route.ts       # GET, POST
│           │   └── [id]/route.ts  # GET, PATCH, DELETE
│           └── users/
│               ├── route.ts       # GET, POST
│               └── [id]/route.ts  # GET, PATCH, DELETE
├── lib/
│   ├── adminAuth.ts               # 权限校验核心库
│   ├── permissionLog.ts           # 权限变更日志
│   └── cache.ts                   # 缓存工具（已扩展）
└── prisma/
    └── schema.prisma              # 数据模型（已扩展）
```

---

## 六、验收标准

| 功能 | 验收条件 |
|------|---------|
| 权限校验 | 未授权 API 返回 403，授权 API 正常访问 |
| 缓存机制 | 权限查询优先从缓存获取，数据库查询减少 80% |
| 日志记录 | 所有权限变更记录完整，可查询审计 |
| 动态生效 | 权限变更后，用户刷新页面即可获取新权限 |
| UI 页面 | 权限管理页面正常展示和操作 |
| 测试覆盖 | 核心权限校验逻辑测试通过 |

---

## 七、任务优先级

1. **P0 (必须)**: 权限校验中间件、缓存机制、API 完善
2. **P1 (重要)**: 权限变更日志、权限管理 UI 页面
3. **P2 (增强)**: 动态权限刷新、测试覆盖