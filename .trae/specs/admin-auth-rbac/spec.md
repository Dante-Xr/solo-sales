# Admin Login & RBAC Spec

## Why
后台管理系统目前缺乏独立的身份验证和权限控制机制，任何人都可以直接访问管理后台。需要添加管理员登录页面和基于角色/权限的访问控制系统，以确保后台安全。

## What Changes
- 新增管理员登录页面 (`/admin/login`)
- 新增权限 (Permission) 数据模型和 CRUD
- 新增角色 (Role) 数据模型和 CRUD
- 新增管理员用户 (AdminUser) 数据模型和 CRUD
- 新增认证中间件保护管理后台
- 在导航栏添加入口

## Impact
- Affected specs: admin-v0.3.2 (后台管理页面需登录后访问)
- Affected code: 新增 `/api/admin/*` 路由，新增 `/admin/*` 页面

---

## ADDED Requirements

### Requirement: 管理员登录
系统 SHALL 提供管理员登录功能，使用邮箱和密码进行身份验证。

#### Scenario: 成功登录
- **WHEN** 管理员在 `/admin/login` 页面输入正确的邮箱和密码
- **THEN** 系统 SHALL 返回成功响应并设置认证 Cookie
- **AND** 页面 SHALL 自动跳转到 `/admin`

#### Scenario: 登录失败
- **WHEN** 管理员输入错误的邮箱或密码
- **THEN** 系统 SHALL 返回 401 错误
- **AND** 页面 SHALL 显示"邮箱或密码错误"提示

#### Scenario: 记住登录
- **WHEN** 管理员勾选"记住登录"并成功登录
- **THEN** 认证 Cookie SHALL 设置更长的过期时间 (7天)
- **AND** 否则认证 Cookie SHALL 在浏览器关闭后过期

### Requirement: 管理员登出
系统 SHALL 提供管理员登出功能，清除认证状态。

#### Scenario: 登出
- **WHEN** 管理员点击登出按钮
- **THEN** 系统 SHALL 清除认证 Cookie
- **AND** 页面 SHALL 跳转到 `/admin/login`

### Requirement: 权限管理
系统 SHALL 提供权限的增删改查功能。

#### Scenario: 创建权限
- **WHEN** 管理员在权限管理页面填写权限信息并提交
- **THEN** 系统 SHALL 创建新的权限记录
- **AND** 返回创建的权限数据

#### Scenario: 删除权限
- **WHEN** 管理员删除已被角色使用的权限
- **THEN** 系统 SHALL 返回错误提示
- **AND** 拒绝删除操作

### Requirement: 角色管理
系统 SHALL 提供角色的增删改查和权限分配功能。

#### Scenario: 创建角色
- **WHEN** 管理员创建新角色并选择关联权限
- **THEN** 系统 SHALL 创建角色记录并关联选中的权限

#### Scenario: 编辑角色权限
- **WHEN** 管理员修改角色的权限
- **THEN** 系统 SHALL 更新角色的权限关联

### Requirement: 管理员用户管理
系统 SHALL 提供管理员用户的增删改查和状态管理功能。

#### Scenario: 创建管理员
- **WHEN** 管理员创建新用户并选择角色
- **THEN** 系统 SHALL 创建用户记录并关联选中的角色
- **AND** 密码 SHALL 使用 bcrypt 加密存储

#### Scenario: 禁用管理员
- **WHEN** 管理员将某用户的 `isActive` 设置为 false
- **THEN** 该用户 SHALL 无法登录系统

### Requirement: 访问控制
系统 SHALL 使用中间件保护管理后台路由，未登录用户访问时重定向到登录页。

#### Scenario: 未登录访问受保护路由
- **WHEN** 未登录用户直接访问 `/admin`
- **THEN** 系统 SHALL 重定向到 `/admin/login`

---

## MODIFIED Requirements

### Requirement: 管理后台访问控制
原有管理后台页面 SHALL 需要管理员登录后才能访问。

---

## REMOVED Requirements

无

---

## 数据模型

### Permission
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键 |
| name | string | 权限标识 (如: products.view) |
| label | string | 显示名称 |
| description | string | 描述 |
| type | enum | page / action |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### Role
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键 |
| name | string | 角色标识 (如: admin) |
| label | string | 显示名称 |
| description | string | 描述 |
| permissions | string[] | 权限 ID 数组 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### AdminUser
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键 |
| username | string | 用户名 (唯一) |
| email | string | 邮箱 (唯一) |
| password | string | 加密密码 |
| roleId | string | 关联角色 |
| isActive | boolean | 是否启用 |
| lastLoginAt | DateTime | 最后登录时间 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

---

## 默认数据

### 权限
30+ 项预置权限 (dashboard, products, orders, customers, knowledge, users, roles, permissions, settings)

### 角色
- super_admin: 超级管理员 (所有权限)
- operator: 运营管理员
- support: 客服

### 默认管理员
- 邮箱: admin@solosales.com
- 密码: Admin@123456
- 角色: super_admin

---

## 验收标准

| 功能 | 标准 |
|------|------|
| 登录 | 正确邮箱密码可登录，错误时显示提示 |
| 登出 | 清除状态并跳转登录页 |
| 权限 CRUD | 正常增删改查，删除检查引用 |
| 角色 CRUD | 正常增删改查，支持权限分配 |
| 用户 CRUD | 正常增删改查，密码加密存储 |
| 访问控制 | 未登录访问 `/admin` 重定向到登录页 |
| 移动端 | 登录页和后台页面适配 iPhone 13 Pro Max (428px) 和小米 14 Ultra (393px) |
