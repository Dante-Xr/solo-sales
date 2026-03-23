# Tasks
- [x] Task 1: 创建语言国际化系统: 实现中英文语言切换和翻译文本管理。
  - [x] SubTask 1.1: 创建 `src/context/LanguageContext.tsx` 语言上下文
  - [x] SubTask 1.2: 创建 `src/i18n/translations.ts` 翻译文本
  - [x] SubTask 1.3: 在 `src/app/layout.tsx` 中集成 LanguageProvider
- [x] Task 2: 创建用户菜单组件: 创建 UserMenu 组件实现用户图标和下拉菜单。
  - [x] SubTask 2.1: 创建 `src/components/storefront/UserMenu.tsx`
  - [x] SubTask 2.2: 实现 useSession 登录状态检测
  - [x] SubTask 2.3: 实现未登录菜单（登录/注册入口）
  - [x] SubTask 2.4: 实现已登录菜单（个人资料/订单/管理后台/退出）
- [x] Task 3: 创建个人资料页面: 创建用户个人资料页面。
  - [x] SubTask 3.1: 创建 `src/app/profile/page.tsx`
  - [x] SubTask 3.2: 实现用户信息展示
  - [x] SubTask 3.3: 实现编辑功能
- [x] Task 4: 集成到首页 Header: 在 page.tsx 中添加用户菜单和语言切换。
  - [x] SubTask 4.1: 修改 `src/app/page.tsx` Header
  - [x] SubTask 4.2: 添加 UserMenu 组件
  - [x] SubTask 4.3: 添加语言切换按钮

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 4] depends on [Task 1] and [Task 2]
- [Task 3] can be executed in parallel after [Task 1]
