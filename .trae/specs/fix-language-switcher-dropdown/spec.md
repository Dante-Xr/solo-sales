# 语言切换下拉菜单与购物车图标黑点修复 Spec

## Why
语言切换按钮点击后没有任何反应，用户无法在中文和英文之间切换；购物车图标左下角有一个视觉异常的黑点，影响用户体验。

## What Changes
- 重写 LanguageSwitcher 组件：从单按钮切换改为下拉菜单式，提供"中文"和"English"两个选项
- 移除 LanguageSwitcher 中 Globe 图标右下角的小圆点装饰（即用户看到的"黑点"）
- 确保语言切换使用 `router.push(pathname, { locale: newLocale })` 正确 API 调用，触发完整页面导航加载新语言的翻译

## Impact
- Affected code: `src/components/storefront/LanguageSwitcher.tsx`（重写）
- Affected code: 所有引用 LanguageSwitcher 的页面（无需修改，接口不变）

## ADDED Requirements

### Requirement: 语言切换下拉菜单
系统 SHALL 提供一个下拉菜单式的语言切换组件，点击 Globe 图标后在图标下方显示下拉菜单，包含"中文"和"English"两个选项。

#### Scenario: 用户点击语言切换图标
- **WHEN** 用户点击 Globe 图标
- **THEN** 在图标下方出现下拉菜单，包含"中文"和"English"两个选项，当前语言高亮显示

#### Scenario: 用户选择中文
- **WHEN** 用户在语言下拉菜单中点击"中文"
- **THEN** 页面导航到中文版本的 URL（/zh/...），所有页面文字变为中文，下拉菜单关闭

#### Scenario: 用户选择 English
- **WHEN** 用户在语言下拉菜单中点击"English"
- **THEN** 页面导航到英文版本的 URL（/en/...），所有页面文字变为英文，下拉菜单关闭

#### Scenario: 点击菜单外部关闭
- **WHEN** 下拉菜单已打开，用户点击菜单外部区域
- **THEN** 下拉菜单关闭，不执行语言切换

### Requirement: 移除图标装饰性黑点
系统 SHALL 移除 LanguageSwitcher 组件中 Globe 图标右下角的装饰性小圆点元素。

#### Scenario: 购物车图标无黑点
- **WHEN** 用户查看页面右上角图标区域
- **THEN** 购物车图标附近无任何异常黑点

## MODIFIED Requirements

### Requirement: 语言切换导航方式
语言切换 SHALL 使用 `@/i18n/navigation` 的 `useRouter` 和 `usePathname`，通过 `router.push(pathname, { locale: newLocale })` 实现导航，确保 next-intl 的 proxy 正确处理语言前缀重定向并加载对应语言的翻译消息。

## REMOVED Requirements
（无）
