# Tasks

- [x] Task 1: 在 AdminLayout 添加用户菜单
  - [x] SubTask 1.1: 在 PC 端侧边栏顶部添加用户头像/用户名区域
  - [x] SubTask 1.2: 实现下拉菜单（个人资料、修改密码、登出）
  - [x] SubTask 1.3: 在移动端顶部栏添加用户菜单入口

- [x] Task 2: 创建管理员个人资料页面
  - [x] SubTask 2.1: 创建 `/admin/profile` 页面路由
  - [x] SubTask 2.2: 实现资料展示（邮箱、用户名、角色、最后登录）
  - [x] SubTask 2.3: 实现用户名修改功能
  - [x] SubTask 2.4: 实现密码修改功能（验证旧密码）

- [x] Task 3: 创建个人资料管理 API
  - [x] SubTask 3.1: 创建 `/api/admin/profile` GET 接口获取资料
  - [x] SubTask 3.2: 创建 `/api/admin/profile` PUT 接口更新资料
  - [x] SubTask 3.3: 实现密码验证与更新逻辑

# Task Dependencies
- Task 2 依赖 Task 3（API 完成后才能实现页面功能）
- Task 1 可以独立进行