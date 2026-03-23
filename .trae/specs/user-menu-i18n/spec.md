# 用户菜单组件与国际化 Spec

## Why
完善独立站用户体验：添加用户登录入口到首页 Header，支持已登录用户快速访问个人中心和订单；同时支持中英文语言切换，提升国际化体验。

## What Changes
- 创建 `UserMenu` 组件（用户图标 + 下拉菜单）
- 创建个人资料页面 `/profile`
- 添加语言切换功能（中文/English）
- 实现语言国际化（i18n）

## Impact
- Affected specs: 首页 Header、用户认证、国际化
- Affected code:
  - `src/components/storefront/UserMenu.tsx` (New)
  - `src/app/profile/page.tsx` (New)
  - `src/context/LanguageContext.tsx` (New)
  - `src/i18n/` (New - translations)
  - `src/app/page.tsx` (Modify)

## ADDED Requirements
### Requirement: 用户菜单组件
The system SHALL provide a user icon with dropdown menu in the header. The menu SHALL show different options based on login status.

#### Scenario: Unauthenticated User
- **WHEN** user clicks the user icon while not logged in
- **THEN** dropdown shows "登录" and "注册" options
- **WHEN** user clicks "登录"
- **THEN** AuthModal opens with login tab active

#### Scenario: Authenticated User
- **WHEN** user clicks the user icon while logged in
- **THEN** dropdown shows "个人资料", "我的订单", "管理后台" (if admin), and "退出登录"
- **WHEN** user clicks "退出登录"
- **THEN** session is cleared and user is redirected to home

### Requirement: 个人资料页面
The system SHALL provide a profile page for users to view and edit their information.

#### Scenario: View Profile
- **WHEN** logged-in user visits `/profile`
- **THEN** they see their name, email, and account info
- **WHEN** user clicks "编辑"
- **THEN** fields become editable

### Requirement: 语言切换
The system SHALL provide a language switcher to toggle between Chinese and English.

#### Scenario: Switch Language
- **WHEN** user clicks language switcher
- **THEN** all UI text changes to selected language
- **WHEN** user refreshes page
- **THEN** language preference is remembered

## MODIFIED Requirements
### Requirement: 首页 Header
The header SHALL include user icon next to cart icon.
