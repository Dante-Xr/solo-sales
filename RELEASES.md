# SoloSales Release Notes

Comprehensive version history documenting all functional modules and features from version 1.0 to current release.

---

## Release Timeline

| Version | Release Date | Status |
|---------|-------------|--------|
| [1.0.2](#v102---2026-04-23) | 2026-04-23 | Latest |
| [1.0.0](#v100---2026-04-21) | 2026-04-21 | Stable |

---

## [Unreleased] - 2026-04-23

### Today's Changes

#### UI/UX Optimization

| Module | Change | Commit Reference |
|--------|--------|------------------|
| MobileMenu | 工具菜单语言切换: "语言"标题改为"Language/语言"，选项固定为"中文"和"English"（不随语言切换变化） | - |
| StorefrontFooter | Footer 布局调整: PC 端"商城"与"公司"列从纵向改为横向排列 | - |
| Global | 响应式布局: 新增移动端独立响应式方案，优化不同屏幕尺寸下的显示效果、间距、字体和触控体验 | - |

#### Icon Updates

| Module | Change | Commit Reference |
|--------|--------|------------------|
| StorefrontFooter | Twitter → X: 更新所有 Twitter 相关图标和链接为 X (x.com) | - |
| ShareMenu | Twitter → X: 更新所有 Twitter 相关图标和链接为 X (x.com) | - |
| ProductMeta | Twitter → X: 更新 Twitter Card 为 X Card | - |
| Global | TikTok Logo: 替换为官方最新 SVG 图标 | - |

#### Viewport Mode Switching

| Module | Feature | Description |
|--------|---------|-------------|
| ViewportWrapper | PC 端手机模式 | 在 PC 端浏览器中实现手机端页面模式切换功能 |
| useViewportModeStore | 状态管理 | Zustand store 管理视口模式状态 |
| globals.css | CSS 覆盖层 | 通过 `[data-viewport="mobile"]` 选择器覆盖 Tailwind 响应式断点 |

**Key Technical Details:**
- 页面布局严格受"切换 PC 端/手机端"按钮控制，不受浏览器窗口大小影响
- 动态修改 viewport meta 标签 (`width=375` for mobile, `width=device-width` for PC)
- 添加 `data-viewport` 属性到 html 元素

#### Dependency Updates

- 移除 lucide-react 的 Twitter 图标，使用自定义 SVG 组件

---

## v1.0.2 - 2026-04-23

### Bug Fixes

| Issue | Module | Fix Description |
|-------|--------|-----------------|
| Type Error | Auth/Session | 修复 `session.user.id` 类型错误 |
| Type Error | TypeScript | 修复 TypeScript 类型错误 - session.user.id 和 i18n locale |
| Functionality | i18n | 修复语言切换功能 |

---

## v1.0.0 - 2026-04-21

### Phase 5: Framework and Tremor Component Integration

#### Framework Upgrades

| Module | Feature | Description |
|--------|---------|-------------|
| Refine | Admin Framework | 集成 Refine 框架用于后台管理 |
| Tremor | Data Visualization | 集成 Tremor 组件库用于数据可视化 |

**Modules Affected:**
- Admin Dashboard
- Data Analytics
- Order Management
- Customer Management
- Marketing Tools
- Distribution System

#### Completed Features

- ✅ Refine 框架集成
- ✅ Tremor 图表组件
- ✅ Phase 5 所有功能模块完成

---

## Version History Summary

### Feature Categories by Version

| Category | v1.0.2 | v1.0.0 |
|----------|--------|--------|
| UI/UX | ✅ | ✅ |
| Bug Fixes | ✅ | - |
| Framework | - | ✅ |
| Icons | ✅ | - |
| Viewport Mode | ✅ | - |

### Technical Stack Evolution

```
v1.0.0 - v1.0.2
├── Refine Framework (Admin)
├── Tremor Components (Charts)
├── next-intl (i18n)
├── Zustand (State Management)
├── TanStack Query (Data Fetching)
├── next-themes (Dark Mode)
└── Stripe/PayPal (Payments)
```

---

## Migration Guides

### Upgrading to v1.0.x

**Breaking Changes:** None in v1.0.x range

**Recommended Actions:**
1. Clear browser cache after update (viewport mode changes)
2. Verify locale settings after language switch updates
3. Test mobile viewport mode on PC browsers

### Environment Variables

No new environment variables required for v1.0.x updates.

---

## Deprecation Notices

None in current release.

---

## Known Issues

None reported in current release.

---

## Contributors

Development by SoloSales Team

---

## Changelog Categories

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability patches
- **Performance**: Performance improvements
- **Refactor**: Code refactoring
- **UI/UX**: User interface and experience updates
- **Infrastructure**: DevOps, deployment, tooling updates

---

*This document is automatically updated with each release. For detailed commit history, visit the [GitHub repository](https://github.com/Dante-Xr/solo-sales).*
