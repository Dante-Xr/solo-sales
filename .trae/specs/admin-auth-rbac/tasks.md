# Admin Auth RBAC Tasks

## Phase 1: 数据库模型

- [ ] 1.1: 更新 Prisma schema 添加 Permission, Role, AdminUser 模型
  - [ ] 添加 Permission 模型 (name, label, description, type)
  - [ ] 添加 Role 模型 (name, label, description, permissions)
  - [ ] 添加 AdminUser 模型 (username, email, password, roleId, isActive, lastLoginAt)
  - [ ] 运行 prisma generate 和 prisma db push

- [ ] 1.2: 创建数据种子文件添加默认数据
  - [ ] 创建权限种子数据 (30+ 权限)
  - [ ] 创建角色种子数据 (super_admin, operator, support)
  - [ ] 创建默认管理员用户 (admin@solosales.com)

## Phase 2: 认证 API

- [ ] 2.1: 创建管理员认证中间件
  - [ ] src/middleware/adminAuth.ts - 验证 Cookie 中的管理员 Token
  - [ ] 支持 Cookie 解析和验证

- [ ] 2.2: 创建管理员认证 API 路由
  - [ ] POST /api/admin/auth/login - 登录接口
    - 接收 email 和 password
    - 验证密码 (bcrypt)
    - 生成 JWT Token 并设置 Cookie
    - 更新最后登录时间
  - [ ] POST /api/admin/auth/logout - 登出接口
    - 清除 Cookie
  - [ ] GET /api/admin/auth/me - 获取当前管理员信息
    - 从 Cookie 获取管理员信息
    - 返回管理员详情 (不含密码)

## Phase 3: 权限 API

- [ ] 3.1: GET /api/admin/permissions - 获取权限列表
  - [ ] 支持分页 (page, pageSize)
  - [ ] 支持类型筛选 (type)

- [ ] 3.2: POST /api/admin/permissions - 创建权限
  - [ ] 验证 name 唯一性
  - [ ] Zod schema 验证

- [ ] 3.3: PATCH /api/admin/permissions/[id] - 更新权限

- [ ] 3.4: DELETE /api/admin/permissions/[id] - 删除权限
  - [ ] 检查是否被角色使用

## Phase 4: 角色 API

- [ ] 4.1: GET /api/admin/roles - 获取角色列表
  - [ ] 包含权限详情

- [ ] 4.2: POST /api/admin/roles - 创建角色
  - [ ] 验证 name 唯一性
  - [ ] 权限 ID 数组验证

- [ ] 4.3: PATCH /api/admin/roles/[id] - 更新角色
  - [ ] 权限关联更新

- [ ] 4.4: DELETE /api/admin/roles/[id] - 删除角色
  - [ ] 检查是否被用户使用

## Phase 5: 用户 API

- [ ] 5.1: GET /api/admin/users - 获取用户列表
  - [ ] 包含角色详情
  - [ ] 支持分页
  - [ ] 支持 isActive 筛选

- [ ] 5.2: POST /api/admin/users - 创建用户
  - [ ] 验证 email/username 唯一性
  - [ ] 密码 bcrypt 加密

- [ ] 5.3: PATCH /api/admin/users/[id] - 更新用户
  - [ ] 支持更新角色
  - [ ] 支持启用/禁用

- [ ] 5.4: DELETE /api/admin/users/[id] - 删除用户

## Phase 6: 登录页面

- [ ] 6.1: 创建登录页面布局
  - [ ] src/app/admin/login/page.tsx
  - [ ] 居中卡片样式
  - [ ] SoloSales Logo/标题
  - [ ] 响应式设计 (移动端全宽)

- [ ] 6.2: 登录表单
  - [ ] 邮箱输入框
  - [ ] 密码输入框
  - [ ] 记住登录复选框
  - [ ] 登录按钮 (加载状态)

- [ ] 6.3: 表单验证
  - [ ] 邮箱格式验证
  - [ ] 必填项验证
  - [ ] 错误提示显示

- [ ] 6.4: 登录逻辑
  - [ ] 调用 /api/admin/auth/login
  - [ ] 成功跳转 /admin
  - [ ] 失败显示错误信息

## Phase 7: 权限管理页面

- [ ] 7.1: 权限列表页面
  - [ ] src/app/admin/permissions/page.tsx
  - [ ] 表格展示权限
  - [ ] 分页

- [ ] 7.2: 创建/编辑权限 Dialog
  - [ ] 表单 (name, label, description, type)
  - [ ] 验证逻辑

- [ ] 7.3: 删除权限确认
  - [ ] 检查引用

## Phase 8: 角色管理页面

- [ ] 8.1: 角色列表页面
  - [ ] src/app/admin/roles/page.tsx
  - [ ] 表格展示角色
  - [ ] 显示关联权限数量

- [ ] 8.2: 创建/编辑角色 Dialog
  - [ ] 表单 (name, label, description)
  - [ ] 权限复选框列表 (分组展示)
  - [ ] 保存逻辑

- [ ] 8.3: 删除角色确认
  - [ ] 检查用户引用

## Phase 9: 用户管理页面

- [ ] 9.1: 用户列表页面
  - [ ] src/app/admin/users/page.tsx
  - [ ] 表格展示用户
  - [ ] 显示角色名称
  - [ ] 状态 Badge

- [ ] 9.2: 创建/编辑用户 Dialog
  - [ ] 表单 (username, email, password, roleId)
  - [ ] 角色下拉选择
  - [ ] 启用/禁用开关

- [ ] 9.3: 删除用户确认

## Phase 10: 导航和集成

- [ ] 10.1: 更新 AdminLayout 添加导航入口
  - [ ] 用户管理入口 (权限下)
  - [ ] 角色管理入口 (权限下)

- [ ] 10.2: 添加用户菜单
  - [ ] 显示当前管理员
  - [ ] 登出按钮

- [ ] 10.3: 保护管理后台路由
  - [ ] /admin 路径需要登录
  - [ ] 未登录重定向到 /admin/login

- [ ] 10.4: 移动端适配
  - [ ] 登录页响应式
  - [ ] 管理页面移动端布局

## Phase 11: 测试验证

- [ ] 11.1: 构建验证
  - [ ] npm run build

- [ ] 11.2: 功能测试
  - [ ] 登录/登出流程
  - [ ] CRUD 操作
  - [ ] 访问控制

---

## 任务依赖

```
1.1 → 1.2 (种子数据依赖模型)
1.2 → 2.2 (API 依赖模型和种子)
2.1 → 2.2 → 2.3 → 2.4 (API 互相独立可并行)
3.1-3.4 (可并行)
4.1-4.4 (可并行)
5.1-5.4 (可并行)
6.1-6.4 (可部分并行)
7.1-7.3 (依赖 API)
8.1-8.3 (依赖 API)
9.1-9.3 (依赖 API)
10.1-10.4 (依赖以上所有)
11.1 → 11.2 → 11.3
```

---

## 实施顺序

1. Phase 1: 数据库模型 (基础)
2. Phase 2-5: 后端 API (基础)
3. Phase 6: 登录页面 (核心)
4. Phase 7-9: 管理页面
5. Phase 10: 导航集成
6. Phase 11: 测试验证
