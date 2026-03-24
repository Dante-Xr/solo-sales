# RBAC 权限管理模块任务清单

## Phase 1: 数据模型扩展

- [ ] 1.1: 扩展 Prisma schema
  - [ ] 在 PermissionType 枚举中添加 DATA 类型
  - [ ] 创建 PermissionLog 模型
  - [ ] 添加 PermissionLog 与 AdminUser 的关联

- [ ] 1.2: 运行 prisma generate

- [ ] 1.3: 运行 prisma db push

---

## Phase 2: 权限校验核心库

- [ ] 2.1: 创建 `src/lib/adminAuth.ts`
  - [ ] verifyAdminToken(request) - 验证 Token 并返回管理员信息
  - [ ] getAdminPermissions(adminId) - 获取用户权限列表（优先缓存）
  - [ ] hasPermission(adminId, permission) - 检查是否拥有某权限
  - [ ] hasAnyPermission(adminId, permissions[]) - 检查是否拥有任一权限
  - [ ] hasAllPermissions(adminId, permissions[]) - 检查是否拥有所有权限
  - [ ] invalidatePermissionCache(adminId) - 清除用户权限缓存
  - [ ] invalidateRoleCache(roleId) - 清除角色权限缓存

- [ ] 2.2: 创建权限校验中间件函数
  - [ ] requireAuth() - 要求登录
  - [ ] requirePermission(permission) - 要求特定权限
  - [ ] requireAnyPermission(permissions) - 要求任一权限
  - [ ] requireAllPermissions(permissions) - 要求所有权限

---

## Phase 3: 缓存机制扩展

- [ ] 3.1: 扩展 `src/lib/cache.ts`
  - [ ] 添加 ADMIN_PERMISSIONS 缓存键
  - [ ] 添加 ROLE_PERMISSIONS 缓存键
  - [ ] 添加 ALL_PERMISSIONS 缓存键
  - [ ] 添加 cacheGetPermissions()
  - [ ] 添加 cacheSetPermissions()
  - [ ] 添加 cacheInvalidatePermissions()

- [ ] 3.2: 实现权限缓存获取
  - [ ] 缓存命中时直接返回
  - [ ] 缓存未命中时查询数据库并缓存

- [ ] 3.3: 实现权限缓存失效
  - [ ] 用户权限变更时清除用户缓存
  - [ ] 角色权限变更时清除该角色下所有用户缓存
  - [ ] 权限本身变更时清除所有相关缓存

---

## Phase 4: 权限变更日志

- [ ] 4.1: 创建 `src/lib/permissionLog.ts`
  - [ ] logCreate() - 记录创建操作
  - [ ] logUpdate() - 记录更新操作
  - [ ] logDelete() - 记录删除操作
  - [ ] getLogs() - 获取日志列表（支持分页、筛选）

- [ ] 4.2: 在权限 API 中集成日志
  - [ ] POST /api/admin/permissions - 记录创建日志
  - [ ] PATCH /api/admin/permissions/:id - 记录更新日志
  - [ ] DELETE /api/admin/permissions/:id - 记录删除日志

- [ ] 4.3: 在角色 API 中集成日志
  - [ ] POST /api/admin/roles - 记录创建日志
  - [ ] PATCH /api/admin/roles/:id - 记录更新日志（含权限变更）
  - [ ] DELETE /api/admin/roles/:id - 记录删除日志

- [ ] 4.4: 在用户 API 中集成日志
  - [ ] POST /api/admin/users - 记录创建日志
  - [ ] PATCH /api/admin/users/:id - 记录更新日志
  - [ ] DELETE /api/admin/users/:id - 记录删除日志

---

## Phase 5: API 完善

- [ ] 5.1: 完善 `/api/admin/permissions/[id]/route.ts`
  - [ ] GET - 获取单个权限详情
  - [ ] PATCH - 更新权限
  - [ ] DELETE - 删除权限（含引用检查）

- [ ] 5.2: 完善 `/api/admin/roles/[id]/route.ts`
  - [ ] GET - 获取单个角色详情（含权限）
  - [ ] PATCH - 更新角色（含权限关联更新）
  - [ ] DELETE - 删除角色（含用户引用检查）

- [ ] 5.3: 完善 `/api/admin/users/[id]/route.ts`
  - [ ] GET - 获取单个用户详情
  - [ ] PATCH - 更新用户（角色、状态）
  - [ ] DELETE - 删除用户

- [ ] 5.4: 为所有 Admin API 添加权限校验
  - [ ] permissions/* - 需要 permissions.* 权限
  - [ ] roles/* - 需要 roles.* 权限
  - [ ] users/* - 需要 users.* 权限

---

## Phase 6: 权限管理 UI

- [ ] 6.1: 创建 `/src/app/admin/permissions/page.tsx`
  - [ ] 权限列表表格组件
  - [ ] 分页控件
  - [ ] 权限类型 Badge 显示

- [ ] 6.2: 创建权限 Dialog 组件
  - [ ] 创建权限表单（name, label, description, type）
  - [ ] 编辑权限表单
  - [ ] 表单验证

- [ ] 6.3: 创建删除确认 Dialog
  - [ ] 显示权限被引用信息
  - [ ] 阻止删除已使用的权限

- [ ] 6.4: 更新侧边栏导航
  - [ ] 添加权限管理菜单项
  - [ ] 添加权限管理路由保护

---

## Phase 7: 动态权限生效

- [ ] 7.1: 扩展登录响应
  - [ ] 登录时返回完整权限列表
  - [ ] 返回权限缓存版本号

- [ ] 7.2: 创建前端权限 Hook
  - [ ] usePermissions() - 获取和刷新权限
  - [ ] hasPermission(permission) - 检查权限
  - [ ] 定期自动刷新（每5分钟）

- [ ] 7.3: 添加权限变更通知机制
  - [ ] 管理员权限变更后返回标记
  - [ ] 前端检测到标记后强制刷新权限

---

## Phase 8: 测试覆盖

- [ ] 8.1: 权限校验单元测试
  - [ ] verifyAdminToken 测试
  - [ ] hasPermission 测试
  - [ ] 缓存逻辑测试

- [ ] 8.2: API 集成测试
  - [ ] 权限校验中间件测试
  - [ ] CRUD API 测试
  - [ ] 权限校验测试

- [ ] 8.3: 缓存机制测试
  - [ ] 缓存命中/未命中测试
  - [ ] 缓存失效测试

---

## 实施顺序

```
1. Phase 1: 数据模型扩展 (基础)
2. Phase 2: 权限校验核心库 (基础)
3. Phase 3: 缓存机制扩展 (基础)
4. Phase 4: 权限变更日志 (基础)
5. Phase 5: API 完善 (核心)
6. Phase 6: 权限管理 UI (重要)
7. Phase 7: 动态权限生效 (重要)
8. Phase 8: 测试覆盖 (收尾)
```

---

## 任务依赖

```
1.1 → 1.2 → 1.3
1.3 → 2.1 → 2.2 → 3.1 → 3.2 → 3.3 → 4.1 → 4.2 → 4.3 → 4.4 → 5.1 → 5.2 → 5.3 → 5.4 → 6.1 → 6.2 → 6.3 → 6.4 → 7.1 → 7.2 → 7.3 → 8.1 → 8.2 → 8.3
```