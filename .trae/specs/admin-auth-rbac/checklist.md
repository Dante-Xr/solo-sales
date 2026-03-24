# Admin Auth RBAC Checklist

## Phase 1: 数据库模型

- [x] Prisma schema 包含 Permission 模型
- [x] Prisma schema 包含 Role 模型
- [x] Prisma schema 包含 AdminUser 模型
- [x] prisma generate 成功
- [x] 种子数据包含 30+ 权限
- [x] 种子数据包含 super_admin, operator, support 角色
- [x] 种子数据包含默认管理员 (admin@solosales.com)

## Phase 2: 认证 API

- [x] POST /api/admin/auth/login 路由存在
- [x] 登录验证邮箱和密码
- [x] 登录成功返回 JWT Token
- [x] 登录成功设置 HTTP-Only Cookie
- [x] POST /api/admin/auth/logout 路由存在
- [x] 登出清除 Cookie
- [x] GET /api/admin/auth/me 路由存在
- [x] 返回当前管理员信息 (不含密码)
- [x] 未登录时返回 401

## Phase 3: 权限 API

- [x] GET /api/admin/permissions 路由存在
- [x] 支持分页参数
- [x] 支持 type 筛选
- [x] POST /api/admin/permissions 路由存在
- [x] name 唯一性验证
- [x] Zod 验证通过
- [x] PATCH /api/admin/permissions/[id] 路由存在
- [x] DELETE /api/admin/permissions/[id] 路由存在
- [x] 删除检查角色引用

## Phase 4: 角色 API

- [x] GET /api/admin/roles 路由存在
- [x] 返回包含权限详情
- [x] POST /api/admin/roles 路由存在
- [x] name 唯一性验证
- [x] 权限 ID 数组验证
- [x] PATCH /api/admin/roles/[id] 路由存在
- [x] 权限关联正确更新
- [x] DELETE /api/admin/roles/[id] 路由存在
- [x] 删除检查用户引用

## Phase 5: 用户 API

- [x] GET /api/admin/users 路由存在
- [x] 返回包含角色详情
- [x] 支持分页
- [x] POST /api/admin/users 路由存在
- [x] email/username 唯一性验证
- [x] 密码使用 bcrypt 加密
- [x] PATCH /api/admin/users/[id] 路由存在
- [x] 支持更新角色
- [x] 支持启用/禁用
- [x] DELETE /api/admin/users/[id] 路由存在

## Phase 6: 登录页面

- [x] /admin/login 页面存在
- [x] 页面居中卡片布局
- [x] SoloSales 标题显示
- [x] 邮箱输入框
- [x] 密码输入框
- [x] 记住登录复选框
- [x] 登录按钮
- [x] 按钮加载状态
- [x] 表单验证 (邮箱格式)
- [x] 错误提示显示
- [x] 成功跳转 /admin
- [x] 移动端全宽样式

## Phase 7: 权限管理页面

- [x] /admin/permissions 页面存在
- [x] 表格展示权限列表
- [x] 分页功能
- [x] 创建权限 Dialog
- [x] 编辑权限 Dialog
- [x] 删除权限确认 Dialog
- [x] 权限类型筛选

## Phase 8: 角色管理页面

- [x] /admin/roles 页面存在
- [x] 表格展示角色列表
- [x] 显示关联权限数量
- [x] 创建角色 Dialog
- [x] 角色权限复选框列表
- [x] 编辑角色 Dialog
- [x] 删除角色确认 Dialog

## Phase 9: 用户管理页面

- [x] /admin/users 页面存在
- [x] 表格展示用户列表
- [x] 显示角色名称
- [x] 状态 Badge 显示
- [x] 创建用户 Dialog
- [x] 角色下拉选择
- [x] 启用/禁用开关
- [x] 编辑用户 Dialog
- [x] 删除用户确认 Dialog

## Phase 10: 导航和集成

- [x] AppSidebar 包含用户管理入口
- [x] AppSidebar 包含角色管理入口
- [x] AppSidebar 包含权限管理入口
- [x] /admin/login 使用独立布局 (不在 AdminLayout 下)
- [x] 登录页面与后台页面布局分离

## Phase 11: 测试验证

- [x] npm run build 成功
- [x] 无 TypeScript 错误
- [ ] 默认管理员可正常登录 (需运行种子数据)
- [ ] 登录后显示管理后台
- [ ] 登出功能正常
- [ ] 权限 CRUD 正常
- [ ] 角色 CRUD 正常
- [ ] 用户 CRUD 正常
- [ ] 移动端布局正常 (iPhone 428px)

---

## 验证说明

- Phase 11 中的运行时测试需要在数据库迁移和种子数据导入后进行
- 使用 `npx ts-node prisma/seed-admin.ts` 导入默认数据
- 默认管理员: admin@solosales.com / Admin@123456
