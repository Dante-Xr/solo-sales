# 管理员个人资料菜单功能规格

## Why
当前后台管理系统右上角只有语言切换和主题切换按钮，缺少管理员个人资料入口。管理员无法快速访问自己的个人资料、修改密码或登出。

## What Changes
- 在 PC 端侧边栏顶部右侧区域添加管理员头像/用户图标
- 点击图标展开下拉菜单，包含：个人资料、修改密码、登出选项
- 移动端顶部导航栏同步添加管理员菜单入口
- 新增 `/admin/profile` 页面用于管理员个人信息管理

## Impact
- Affected specs: admin-auth-rbac
- Affected code:
  - `src/components/admin/AdminLayout.tsx` - 添加用户菜单组件
  - `src/app/admin/profile/page.tsx` - 新增管理员资料页面
  - `src/app/api/admin/profile/route.ts` - 新增资料管理 API
  - `src/components/ui/avatar.tsx` - 使用 shadcn avatar 组件

## ADDED Requirements

### Requirement: 管理员右上角用户菜单
系统应在后台管理系统右上角提供一个用户菜单图标/按钮，点击后展开下拉菜单。

#### Scenario: PC 端显示用户菜单
- **WHEN** 管理员登录后在 PC 端访问后台
- **THEN** 右上角显示用户头像/图标，旁边显示管理员用户名

#### Scenario: 展开用户菜单
- **WHEN** 管理员点击右上角用户图标
- **THEN** 显示下拉菜单，包含：个人资料、修改密码、登出

#### Scenario: 移动端显示用户菜单
- **WHEN** 管理员在移动端访问后台
- **THEN** 顶部导航栏右侧显示用户图标（与语言、主题按钮并排）

### Requirement: 管理员个人资料页面
系统应提供 `/admin/profile` 页面供管理员查看和修改个人信息。

#### Scenario: 查看个人资料
- **WHEN** 管理员访问 `/admin/profile`
- **THEN** 显示当前管理员的邮箱、用户名、角色、最后登录时间

#### Scenario: 修改用户名
- **WHEN** 管理员在资料页面修改用户名并保存
- **THEN** 用户名成功更新，显示成功提示

#### Scenario: 修改密码
- **WHEN** 管理员在资料页面修改密码（输入旧密码和新密码）
- **THEN** 密码成功更新，显示成功提示，下次登录需使用新密码

### Requirement: 管理员登出功能
系统应提供安全的登出功能，清除认证 cookie 并跳转至登录页。

#### Scenario: 登出
- **WHEN** 管理员点击"登出"按钮
- **THEN** 清除 admin_token cookie，跳转至 `/admin/login`，显示"已成功登出"提示

## MODIFIED Requirements

### Requirement: AdminLayout 组件
**原需求**：PC 端侧边栏顶部只显示语言切换和主题切换按钮
**修改为**：PC 端侧边栏顶部显示语言切换、主题切换、以及用户菜单（头像+用户名）

## Technical Notes
- 使用 shadcn/ui Avatar 组件显示管理员头像（默认图标）
- 使用 shadcn/ui DropdownMenu 组件实现下拉菜单
- 管理员用户名从 `/api/admin/auth/me` API 获取
- 密码修改使用 bcrypt 加密存储
