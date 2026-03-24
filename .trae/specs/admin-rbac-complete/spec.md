# RBAC 权限管理模块完善规格说明书

## 1. 概述

### 1.1 项目背景
后台管理系统已有基础的 RBAC 架构（Permission, Role, AdminUser 模型），但缺乏权限校验中间件、缓存机制、日志记录等功能。本模块旨在完善权限控制体系，实现细粒度的访问控制。

### 1.2 目标
- 建立完整的权限校验体系，确保所有 API 请求经过验证
- 实现权限缓存机制，提升系统性能
- 记录权限变更日志，支持审计追踪
- 提供动态权限生效机制，无需重启服务

### 1.3 范围
- 后台管理系统 `/admin` 下的所有 API 和页面
- 权限管理、角色管理、用户管理功能

---

## 2. 系统架构

### 2.1 权限模型
```
Permission (权限)
├── PAGE    - 页面权限（控制菜单访问）
├── ACTION  - 操作权限（控制按钮、操作）
└── DATA    - 数据权限（控制数据范围）

Role (角色)
└── permissions: Permission[] - 多对多关系

AdminUser (管理员)
└── role: Role - 多对一关系
```

### 2.2 权限层级
1. **页面权限**: 控制用户可见的菜单项
2. **操作权限**: 控制用户可执行的按钮操作
3. **数据权限**: 控制用户可访问的数据范围

### 2.3 缓存架构
```
Redis Cache
├── admin:permissions:{adminId}  → 用户权限列表 (TTL: 300s)
├── role:permissions:{roleId}   → 角色权限列表 (TTL: 600s)
└── permissions:all             → 所有权限列表 (TTL: 1800s)
```

### 2.4 日志审计
记录所有权限相关变更操作，支持追溯和审计。

---

## 3. 功能需求

### 3.1 权限校验中间件
**功能**:
- 验证管理员登录状态
- 校验用户权限
- 支持 API 级别的权限控制

**接口**:
```typescript
// 验证 Token
verifyAdminToken(request: NextRequest): Promise<AdminInfo | null>

// 获取用户权限（带缓存）
getAdminPermissions(adminId: string): Promise<string[]>

// 检查权限
hasPermission(adminId: string, permission: string): Promise<boolean>

// 清除缓存
invalidatePermissionCache(adminId?: string): Promise<void>
```

### 3.2 权限缓存机制
**功能**:
- Redis 缓存权限数据
- 权限变更时自动失效缓存
- 支持批量清除

**缓存键**:
```typescript
CACHE_KEYS = {
  ADMIN_PERMISSIONS: (adminId: string) => `admin:permissions:${adminId}`,
  ROLE_PERMISSIONS: (roleId: string) => `role:permissions:${roleId}`,
  ALL_PERMISSIONS: 'permissions:all'
}
```

### 3.3 权限变更日志
**功能**:
- 记录权限创建、更新、删除操作
- 记录角色权限分配变更
- 记录管理员用户变更
- 支持按时间、操作人筛选

**日志内容**:
```typescript
PermissionLog = {
  id: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  targetType: 'PERMISSION' | 'ROLE' | 'ADMIN_USER'
  targetId: string
  operatorId: string
  beforeData: JSON | null
  afterData: JSON | null
  ipAddress: string
  createdAt: DateTime
}
```

### 3.4 API 权限控制
**功能**:
- 权限管理 API (CRUD)
- 角色管理 API (CRUD)
- 用户管理 API (CRUD)
- 所有 API 需要权限校验

**接口列表**:
| 方法 | 路径 | 所需权限 |
|------|------|---------|
| GET | /api/admin/permissions | permissions.view |
| POST | /api/admin/permissions | permissions.create |
| PATCH | /api/admin/permissions/:id | permissions.update |
| DELETE | /api/admin/permissions/:id | permissions.delete |
| GET | /api/admin/roles | roles.view |
| POST | /api/admin/roles | roles.create |
| PATCH | /api/admin/roles/:id | roles.update |
| DELETE | /api/admin/roles/:id | roles.delete |
| GET | /api/admin/users | users.view |
| POST | /api/admin/users | users.create |
| PATCH | /api/admin/users/:id | users.update |
| DELETE | /api/admin/users/:id | users.delete |

### 3.5 权限管理 UI
**页面**: `/admin/permissions`
**功能**:
- 权限列表展示（分页）
- 创建权限 Dialog
- 编辑权限 Dialog
- 删除权限确认（检查引用）

### 3.6 动态权限生效
**功能**:
- 登录时返回完整权限列表
- 前端定期刷新权限（每5分钟）
- 权限变更时通知前端刷新

---

## 4. 数据模型

### 4.1 Permission 模型（已存在）
```prisma
model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  label       String
  description String?
  type        PermissionType @default(ACTION)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  roles       Role[]   @relation("RolePermissions")
}

enum PermissionType {
  PAGE
  ACTION
  DATA
}
```

### 4.2 Role 模型（已存在）
```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  label       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  permissions Permission[] @relation("RolePermissions")
  admins      AdminUser[]
}
```

### 4.3 AdminUser 模型（已存在）
```prisma
model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  password     String
  roleId       String
  role         Role     @relation(fields: [roleId], references: [id])
  isActive     Boolean  @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 4.4 PermissionLog 模型（新增）
```prisma
model PermissionLog {
  id          String   @id @default(cuid())
  action      LogAction
  targetType  TargetType
  targetId    String
  operatorId  String
  beforeData  Json?
  afterData   Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}

enum LogAction {
  CREATE
  UPDATE
  DELETE
}

enum TargetType {
  PERMISSION
  ROLE
  ADMIN_USER
}
```

---

## 5. API 规格

### 5.1 权限 API

#### GET /api/admin/permissions
**描述**: 获取权限列表
**权限**: permissions.view
**参数**:
- page: number (默认 1)
- pageSize: number (默认 50)
- type: 'PAGE' | 'ACTION' | 'DATA' (可选)

**响应**:
```json
{
  "success": true,
  "data": {
    "list": [{ "id", "name", "label", "description", "type" }],
    "pagination": { "page", "pageSize", "total", "totalPages" }
  }
}
```

#### POST /api/admin/permissions
**描述**: 创建权限
**权限**: permissions.create
**请求体**:
```json
{ "name": "products.view", "label": "查看商品", "description": "...", "type": "ACTION" }
```

#### PATCH /api/admin/permissions/:id
**描述**: 更新权限
**权限**: permissions.update

#### DELETE /api/admin/permissions/:id
**描述**: 删除权限
**权限**: permissions.delete
**检查**: 被角色引用的权限不可删除

### 5.2 角色 API

#### GET /api/admin/roles
**描述**: 获取角色列表
**权限**: roles.view

#### POST /api/admin/roles
**描述**: 创建角色
**权限**: roles.create
**请求体**:
```json
{ "name": "operator", "label": "运营员", "description": "...", "permissionIds": [] }
```

#### PATCH /api/admin/roles/:id
**描述**: 更新角色
**权限**: roles.update
**副作用**: 清除该角色下所有用户的权限缓存

#### DELETE /api/admin/roles/:id
**描述**: 删除角色
**权限**: roles.delete
**检查**: 被用户引用的角色不可删除

### 5.3 用户 API

#### GET /api/admin/users
**描述**: 获取用户列表
**权限**: users.view

#### POST /api/admin/users
**描述**: 创建用户
**权限**: users.create

#### PATCH /api/admin/users/:id
**描述**: 更新用户
**权限**: users.update

#### DELETE /api/admin/users/:id
**描述**: 删除用户
**权限**: users.delete

---

## 6. 前端规格

### 6.1 权限 Hook
```typescript
// 获取当前用户权限
const { permissions, refresh } = usePermissions()

// 检查权限
const canViewProducts = hasPermission('products.view')
```

### 6.2 权限管理页面
**路由**: /admin/permissions
**功能**:
- 表格展示权限列表
- 分页控件
- 创建/编辑 Dialog
- 删除确认 Dialog
- 权限类型 Badge

---

## 7. 错误处理

| 错误码 | 说明 |
|--------|------|
| 401 | 未登录或登录已过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复名称） |
| 500 | 服务器错误 |

---

## 8. 性能要求

- 权限校验响应时间 < 50ms
- 缓存命中率 > 80%
- 支持 100+ 并发请求

---

## 9. 安全要求

- 所有 API 需要身份验证
- 敏感操作需要日志记录
- 密码加密存储（bcrypt）
- Token 安全存储（httpOnly Cookie）