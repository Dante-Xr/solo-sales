# 后台管理系统登录与权限管理实施计划

## 一、需求概述

### 1.1 功能需求
- 管理员登录页面（简洁易用风格）
- 权限管理（Permission）
- 角色管理（Role）
- 用户管理（Admin User）

### 1.2 设计风格
- 简洁现代的登录页面
- 清晰的权限管理界面
- 一致的后台设计语言

---

## 二、技术方案

### 2.1 登录页面 (`/admin/login`)
```
文件: src/app/admin/login/page.tsx
```
- 简洁的表单设计（邮箱/用户名 + 密码）
- "记住登录" 选项
- 忘记密码链接（可选）
- 错误提示信息
- 登录按钮加载状态

### 2.2 权限管理
```
文件: src/app/admin/permissions/page.tsx
```
- 权限列表展示（表格）
- 权限标识符、名称、描述
- 创建/编辑/删除权限
- 权限分类（页面权限、操作权限）

### 2.3 角色管理
```
文件: src/app/admin/roles/page.tsx
```
- 角色列表展示
- 角色名称、描述、权限列表
- 创建/编辑/删除角色
- 角色权限分配（复选框）

### 2.4 管理员用户管理
```
文件: src/app/admin/users/page.tsx
```
- 用户列表展示
- 用户名、邮箱、角色、状态
- 创建/编辑/删除用户
- 用户角色分配
- 启用/禁用用户

---

## 三、数据模型

### 3.1 权限模型 (Permission)
```typescript
{
  id: string
  name: string        // 权限名称（如：products.view）
  label: string      // 显示名称（如：查看商品）
  description: string // 权限描述
  type: "page" | "action"  // 权限类型
  createdAt: Date
  updatedAt: Date
}
```

### 3.2 角色模型 (Role)
```typescript
{
  id: string
  name: string        // 角色名称（如：admin, editor）
  label: string       // 显示名称（如：管理员，编辑员）
  description: string // 角色描述
  permissions: string[] // 权限 ID 数组
  createdAt: Date
  updatedAt: Date
}
```

### 3.3 管理员模型 (AdminUser)
```typescript
{
  id: string
  username: string    // 登录用户名
  email: string       // 邮箱
  password: string    // 密码（加密存储）
  roleId: string      // 关联角色
  isActive: boolean   // 是否启用
  lastLoginAt: Date   // 最后登录时间
  createdAt: Date
  updatedAt: Date
}
```

---

## 四、API 设计

### 4.1 认证 API
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/auth/login | 管理员登录 |
| POST | /api/admin/auth/logout | 登出 |
| GET | /api/admin/auth/me | 获取当前管理员信息 |

### 4.2 权限 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/permissions | 获取权限列表 |
| POST | /api/admin/permissions | 创建权限 |
| PATCH | /api/admin/permissions/[id] | 更新权限 |
| DELETE | /api/admin/permissions/[id] | 删除权限 |

### 4.3 角色 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/roles | 获取角色列表 |
| POST | /api/admin/roles | 创建角色 |
| PATCH | /api/admin/roles/[id] | 更新角色 |
| DELETE | /api/admin/roles/[id] | 删除角色 |

### 4.4 用户 API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/users | 获取用户列表 |
| POST | /api/admin/users | 创建用户 |
| PATCH | /api/admin/users/[id] | 更新用户 |
| DELETE | /api/admin/users/[id] | 删除用户 |

---

## 五、实施步骤

### Phase 1: 数据库与后端
1. 创建 Prisma 数据模型（Permission, Role, AdminUser）
2. 实现认证 API（登录/登出/获取当前用户）
3. 实现权限 CRUD API
4. 实现角色 CRUD API
5. 实现用户 CRUD API
6. 添加中间件验证管理员身份

### Phase 2: 前端登录页
1. 创建登录页面 UI
2. 表单验证
3. 登录请求处理
4. 登录状态管理（Cookie/Session）
5. 登录后跳转

### Phase 3: 管理页面
1. 权限管理页面
2. 角色管理页面
3. 用户管理页面
4. 导航栏添加入口

---

## 六、预计工时

| 阶段 | 任务 | 工时 |
|------|------|------|
| 后端 | 数据库模型 | 2h |
| 后端 | 认证 API | 3h |
| 后端 | 权限/角色/用户 API | 6h |
| 前端 | 登录页 | 3h |
| 前端 | 管理页面 (3个) | 9h |
| 测试 | 集成测试 | 3h |
| **合计** | | **26h** |

---

## 七、默认权限配置

### 7.1 默认权限
```
- dashboard.view       - 查看仪表盘
- dashboard.analytics   - 查看数据分析

- products.view         - 查看商品
- products.create       - 创建商品
- products.edit         - 编辑商品
- products.delete       - 删除商品

- orders.view           - 查看订单
- orders.edit           - 编辑订单
- orders.delete         - 删除订单

- customers.view        - 查看客户
- customers.edit        - 编辑客户

- knowledge.view        - 查看知识库
- knowledge.create      - 创建知识
- knowledge.edit        - 编辑知识
- knowledge.delete      - 删除知识

- users.view            - 查看用户
- users.create          - 创建用户
- users.edit            - 编辑用户
- users.delete          - 删除用户

- roles.view            - 查看角色
- roles.create          - 创建角色
- roles.edit            - 编辑角色
- roles.delete          - 删除角色

- permissions.view      - 查看权限
- permissions.create    - 创建权限
- permissions.edit      - 编辑权限
- permissions.delete    - 删除权限

- settings.view         - 查看设置
- settings.edit         - 编辑设置
```

### 7.2 默认角色
```
- 超级管理员 (super_admin)
  - 拥有所有权限

- 运营管理员 (operator)
  - dashboard.view, dashboard.analytics
  - products.*, orders.*, customers.*
  - knowledge.*
  - settings.view, settings.edit

- 客服 (support)
  - dashboard.view
  - customers.view, customers.edit
  - orders.view, orders.edit
  - knowledge.view
```

### 7.3 默认管理员
```
- 用户名: admin
- 邮箱: admin@solosales.com
- 密码: Admin@123456
- 角色: 超级管理员
```

---

## 八、登录页设计

### 8.1 布局
```
┌─────────────────────────────────────┐
│                                     │
│           SoloSales                 │
│           后台管理                   │
│                                     │
│     ┌─────────────────────────┐     │
│     │  管理员邮箱              │     │
│     └─────────────────────────┘     │
│     ┌─────────────────────────┐     │
│     │  密码                   │     │
│     └─────────────────────────┘     │
│                                     │
│     □ 记住登录                      │
│                                     │
│     ┌─────────────────────────┐     │
│     │       登 录             │     │
│     └─────────────────────────┘     │
│                                     │
│         忘记密码？                   │
│                                     │
└─────────────────────────────────────┘
```

### 8.2 响应式
- 桌面端：居中卡片式布局
- 移动端：全宽表单，按钮宽度 100%
