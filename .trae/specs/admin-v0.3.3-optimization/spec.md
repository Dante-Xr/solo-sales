# SoloSales 后台管理系统 v0.3.3 性能优化与移动端适配规格

## 一、背景与目标

### Why
当前 v0.3.2 后台管理系统存在以下问题：
1. 仪表盘页面加载需串行请求多个 API，导致 FCP 达 800ms
2. 列表页面存在不必要的重渲染，滚动流畅度不足
3. 完全缺少移动端适配，在 iPhone 13 Pro Max (428px) 和小米 14 Ultra (393px) 上体验极差
4. 表单交互缺乏即时验证，错误反馈滞后

### What Changes

**Phase 1: 性能优化**
- M1: 创建聚合 Dashboard API，单端点返回所有数据
- M2: 扩展数据缓存层，产品/知识库 API 启用缓存
- M3: 创建 React.memo 优化表格行组件

**Phase 2: 移动端适配**
- M4: 创建响应式 AdminLayout 组件
- M5: 实现响应式表格→卡片视图、Sheet 底部表单
- M6: 触控交互优化（44px 触控区域、滑动操作、下拉刷新）

**Phase 3: 功能增强**
- M7: 批量选择和操作功能
- M8: 表单即时验证 + 键盘快捷键
- M9: ARIA 无障碍标签

---

## 二、目标设备适配规格

| 设备 | 屏幕尺寸 | 分辨率 | DPR | 视口宽度 |
|------|----------|--------|-----|----------|
| iPhone 13 Pro Max | 6.7" | 428 × 926 | 3x | 428px |
| Xiaomi 14 Ultra | 6.73" | 1440 × 3200 | 3x | 393px |

> 注：小米17可能指代小米14 Pro或小米14 Ultra，采用主流旗舰规格（1440p分辨率，393dp视口）进行适配。

---

## 三、影响范围

### Affected Specs
- admin-dashboard: 仪表盘数据聚合
- admin-products: 商品管理列表 + 批量操作
- admin-knowledge: 知识库管理

### Affected Code
- `src/app/api/admin/dashboard/route.ts` (新增)
- `src/app/api/products/route.ts` (修改)
- `src/app/api/products/batch/route.ts` (新增)
- `src/app/admin/page.tsx` (修改)
- `src/app/admin/products/page.tsx` (修改)
- `src/components/admin/AdminLayout.tsx` (新增)
- `src/components/admin/ProductRow.tsx` (新增)
- `src/components/admin/MobileProductCard.tsx` (新增)
- `src/components/admin/StatCard.tsx` (修改)
- `src/hooks/useFormValidation.ts` (新增)
- `src/hooks/useKeyboardShortcuts.ts` (新增)
- `src/hooks/usePullToRefresh.ts` (新增)
- `src/lib/cache.ts` (修改)

---

## 四、ADDED Requirements

### Requirement: 聚合仪表盘 API
系统 SHALL 提供单一 API 端点 `/api/admin/dashboard`，在服务端并行查询 orders、products、users 数据并聚合返回，减少客户端请求次数。

#### Scenario: 仪表盘加载
- **WHEN** 用户访问 `/admin` 页面
- **THEN** 页面应发起单个 GET 请求到 `/api/admin/dashboard`
- **AND** 响应应包含 stats、recentOrders、chartData 三个字段
- **AND** 响应时间应 < 200ms

### Requirement: 移动端响应式布局
系统 SHALL 在屏幕宽度 < 1024px 时自动切换到移动端布局模式，包括顶部导航栏、可折叠侧边栏。

#### Scenario: 移动端菜单交互
- **WHEN** 用户在 iPhone 13 Pro Max (428px) 点击菜单按钮
- **THEN** 侧边栏应从左侧滑入，覆盖层应同时显示
- **AND** 点击覆盖层或关闭按钮应关闭侧边栏
- **AND** 导航项点击后应自动关闭侧边栏

### Requirement: 移动端卡片视图
系统在移动端 (< 768px) SHALL 将产品/知识库表格渲染为卡片列表视图，每个卡片包含关键信息和操作入口。

#### Scenario: 移动端产品卡片交互
- **WHEN** 用户在移动端点击产品卡片的操作按钮
- **THEN** 应显示底部 Sheet 弹出操作菜单
- **AND** 操作按钮 (编辑/删除) 应具有至少 44x44px 的触控区域

### Requirement: 批量操作功能
系统 SHALL 支持产品列表的多选批量操作，包括批量上架、批量下架、批量删除。

#### Scenario: 批量删除
- **WHEN** 用户选择多个产品后点击"批量删除"
- **THEN** 应显示确认对话框列出即将删除的商品数量
- **THEN** 确认后应向 `/api/products/batch` 发送 DELETE 请求
- **THEN** 删除成功后应清空选择并刷新列表

### Requirement: 触控优化
系统 SHALL 在移动端确保所有可交互元素的触控区域不小于 44x44px。

#### Scenario: 触控区域验证
- **WHEN** 设备视口宽度 < 768px
- **THEN** 所有 button、input、select 元素 min-height 应为 44px
- **AND** 表格行高度应 >= 56px

### Requirement: 表单即时验证
系统 SHALL 在用户输入时即时验证表单字段，并在字段下方显示错误提示。

#### Scenario: 必填字段验证
- **WHEN** 用户在"商品名称"字段输入完成后切换到下一字段
- **THEN** 系统应验证字段是否为空
- **AND** 若为空应立即显示"请输入商品名称"错误提示
- **AND** 错误提示应为红色小字体

### Requirement: 键盘快捷键
系统 SHALL 支持常用键盘快捷键以提升操作效率。

#### Scenario: 保存快捷键
- **WHEN** 用户在编辑产品对话框中按下 Cmd/Ctrl + S
- **THEN** 系统应触发保存操作
- **AND** 屏幕上应显示保存中的加载状态

---

## 五、MODIFIED Requirements

### Requirement: 产品列表 API
原有产品列表 API SHALL 增加缓存支持，当请求参数相同时返回缓存结果。

#### Scenario: 缓存命中
- **WHEN** 相同参数的产品列表请求在 5 分钟内第二次发起
- **THEN** 响应应包含 `fromCache: true` 字段
- **AND** 响应时间应 < 50ms

---

## 六、验收标准

### 性能指标
| 指标 | 基线 | 目标 |
|------|------|------|
| Dashboard FCP | 800ms | < 200ms |
| 产品列表 TTI | 500ms | < 300ms |
| 网络请求数 | 4次 | 1次 |

### 移动端适配
| 设备 | 布局 | 触控 | 表单 | 滚动 |
|------|------|------|------|------|
| iPhone 13 Pro Max | ✅ | ✅ | ✅ | ✅ 60fps |
| Xiaomi 14 Ultra | ✅ | ✅ | ✅ | ✅ 60fps |

---

## 七、Breaking Changes

无破坏性变更，所有修改向后兼容。
