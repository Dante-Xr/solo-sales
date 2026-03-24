# Admin v0.4.1 优化验收清单

## Phase 1: 性能优化

### M1: 仪表盘聚合 API
- [ ] `/api/admin/dashboard` 路由文件已创建
- [ ] 并行查询 orders, products, users
- [ ] 集成缓存 (cacheGet/cacheSet)
- [ ] 返回数据结构包含 stats, recentOrders, chartData
- [ ] admin/page.tsx 已更新使用新 API
- [ ] 构建验证通过 (`npm run build`)

### M2: 数据缓存层
- [ ] cache.ts 已添加 ADMIN_DASHBOARD, PRODUCT_LIST, CUSTOMER_LIST
- [ ] cache.ts 已添加 MEDIUM (300s), LONG (600s) TTL
- [ ] 产品 API GET handler 已添加缓存逻辑
- [ ] 缓存命中时响应包含 fromCache: true
- [ ] 知识库 API GET handler 已添加缓存逻辑

### M3: 列表渲染优化
- [ ] ProductRow.tsx 组件已创建
- [ ] 组件使用 React.memo 包装
- [ ] 支持 isSelected 和 onSelect 属性
- [ ] ProductsPage 应用 useMemo 优化

## Phase 2: 移动端适配

### M4: AdminLayout 组件
- [ ] AdminLayout.tsx 已创建
- [ ] 检测 isMobile (window.innerWidth < 1024)
- [ ] 移动端顶部导航栏正确显示
- [ ] 移动端侧边栏可正常展开/收起
- [ ] 侧边栏遮罩层正确显示
- [ ] PC 端固定侧边栏正确显示
- [ ] AdminLayout 已应用到 admin 目录所有页面

### M5: 响应式组件
- [ ] MobileProductCard.tsx 已创建
- [ ] 移动端 (hidden lg:block) 卡片正确显示
- [ ] PC 端表格正确显示
- [ ] 底部 Sheet 操作菜单正确显示
- [ ] StatCard 响应式样式正确 (p-4 vs p-6)
- [ ] 移动端编辑表单使用 Sheet 底部滑入
- [ ] 表单字段高度 h-12 (移动端)

### M6: 触控交互
- [ ] globals.css 添加移动端触控区域样式
- [ ] 按钮 min-height: 44px (移动端)
- [ ] 表格行 min-height: 56px (移动端)
- [ ] 下拉刷新 Hook 已创建
- [ ] 下拉 60px 阈值正确触发

## Phase 3: 功能增强

### M7: 批量操作
- [ ] 批量选择状态正确管理 (Set<string>)
- [ ] 全选/取消全选功能正常
- [ ] BatchActionBar 浮动操作栏正确显示
- [ ] 批量上架功能正常
- [ ] 批量下架功能正常
- [ ] 批量删除确认对话框正确显示
- [ ] `/api/products/batch` API 已创建
- [ ] API 支持 publish/unpublish/delete 操作

### M8: 表单体验
- [ ] useFormValidation Hook 已创建
- [ ] 字段即时验证正确工作
- [ ] 错误提示正确显示
- [ ] useKeyboardShortcuts Hook 已创建
- [ ] Cmd/Ctrl + S 快捷键正确触发保存
- [ ] Cmd/Ctrl + N 快捷键正确触发新建
- [ ] Escape 快捷键正确关闭对话框

### M9: 无障碍
- [ ] Dialog 包含 role="dialog"
- [ ] Dialog 包含 aria-labelledby
- [ ] Dialog 包含 aria-modal
- [ ] Table 包含 role="grid"
- [ ] Table header 包含 role="columnheader"
- [ ] 行支持键盘导航 (Enter/Space)

## Phase 4: 测试验证

### 构建与性能
- [ ] `npm run build` 构建成功
- [ ] 无 TypeScript 错误
- [ ] 无控制台 Error 级别错误
- [ ] package.json 版本号已更新为 0.4.1

### iPhone 13 Pro Max (428px) 适配
- [ ] 布局无横向溢出
- [ ] 顶部导航栏正确显示
- [ ] 侧边栏可正常展开/收起
- [ ] 产品列表以卡片形式显示
- [ ] 所有按钮触控区域 >= 44px
- [ ] 表单可正常填写
- [ ] 滚动流畅无卡顿

### Xiaomi 14 Ultra (393px) 适配
- [ ] 布局无横向溢出
- [ ] 顶部导航栏正确显示
- [ ] 侧边栏可正常展开/收起
- [ ] 产品列表以卡片形式显示
- [ ] 所有按钮触控区域 >= 44px
- [ ] 表单可正常填写
- [ ] 滚动流畅无卡顿

### 功能验收
- [ ] 仪表盘数据准确显示
- [ ] 产品列表加载 < 300ms
- [ ] 产品 CRUD 完整可用
- [ ] 批量选择和操作正常
- [ ] 键盘快捷键正常响应

---

*版本: v0.4.1*
*创建日期: 2026-03-24*
