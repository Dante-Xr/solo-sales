# SoloSales Release Notes

Comprehensive version history documenting all functional modules and features from version 1.0 to current release.

---

## Release Timeline

| Version | Release Date | Status |
|---------|-------------|--------|
| [1.2.0](#v120---2026-04-26) | 2026-04-26 | Latest |
| [1.0.2](#v102---2026-04-23) | 2026-04-23 | Stable |
| [1.0.0](#v100---2026-04-21) | 2026-04-21 | Stable |

---

## v1.2.0 - 2026-04-26

### Phase 4: Admin Feature Enhancement - Advanced Components

#### New Components

| Module | Feature | Description |
|--------|---------|-------------|
| VariantManager | 商品变体管理 | 支持属性组配置、变体组合生成、批量编辑功能 |
| VariantManager | 属性组管理 | 颜色、尺寸、材质等自定义属性组 |
| VariantManager | 变体生成 | 笛卡尔积算法生成变体组合 |
| VariantManager | 批量编辑 | 批量价格/库存编辑，SKU 自动生成 |
| InventoryAlert | 智能库存预警 | 基于销量的智能库存预警系统 |
| InventoryAlert | 预警级别 | 紧急/警告/注意/正常 四级预警 |
| InventoryAlert | 补货建议 | 可售天数预测，建议补货量计算 |
| AuditLog | 操作日志 | 完整的操作审计追踪 |
| AuditLog | 日志筛选 | 多维度筛选（操作类型、操作人、时间范围） |
| AuditLog | 详情对比 | 展开式详情查看（修改前后对比） |

#### Feature Enhancements

| Module | Feature | Description |
|--------|---------|-------------|
| DataExporter | PDF 导出 | 新增 PDF 格式导出支持 |
| DataExporter | jsPDF | 集成 jsPDF 和 jspdf-autotable |
| GlobalSearch | TypeScript Fix | 修复变量引用问题 |

#### Internationalization

| Module | Change | Description |
|--------|--------|-------------|
| zh.json | 新增 67 个翻译键 | 覆盖所有 Phase 4 新增功能 |
| en.json | 新增 67 个翻译键 | 英文翻译同步 |

#### Performance Optimization

| Module | Change | Description |
|--------|--------|-------------|
| AdminLayout | 重渲染优化 | Zustand 状态订阅精确化 |

#### Security Fixes

| Issue | Module | Fix Description |
|-------|--------|----------------|
| CSV Injection | DataExporter | CSV 导出注入漏洞防护 |

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
