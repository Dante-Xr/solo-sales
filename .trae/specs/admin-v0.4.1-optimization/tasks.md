# Admin v0.4.1 优化任务清单

## Phase 1: 性能优化

### M1: 仪表盘性能优化
- [ ] M1.1: 创建聚合 Dashboard API (`/api/admin/dashboard/route.ts`)
  - 并行查询 orders, products, users, recentOrders
  - 集成缓存 (cacheGet/cacheSet)
  - 返回 stats, recentOrders, chartData
- [ ] M1.2: 更新 admin/page.tsx 使用新 API
  - 替换原来的 3 个 fetch 为单一 /api/admin/dashboard
  - 更新数据处理逻辑

### M2: 数据缓存层
- [ ] M2.1: 扩展缓存工具 (`src/lib/cache.ts`)
  - 添加 ADMIN_DASHBOARD, PRODUCT_LIST, CUSTOMER_LIST 缓存键
  - 添加 MEDIUM (300s), LONG (600s) TTL 配置
- [ ] M2.2: 产品 API 缓存 (`/api/products/route.ts`)
  - GET handler 增加缓存逻辑
  - 缓存 key 包含分页和筛选参数
- [ ] M2.3: 知识库 API 缓存 (`/api/knowledge/route.ts`)
  - GET handler 增加缓存逻辑

### M3: 列表渲染优化
- [ ] M3.1: 创建 ProductRow 组件 (`src/components/admin/ProductRow.tsx`)
  - 使用 React.memo 包装
  - 支持单选复选框
  - 统一表格行样式
- [ ] M3.2: 应用 useMemo 优化 ProductsPage
  - 缓存格式化后的产品数据
  - 减少不必要的重新渲染

## Phase 2: 移动端适配

### M4: 移动端基础框架
- [ ] M4.1: 创建 AdminLayout 组件 (`src/components/admin/AdminLayout.tsx`)
  - 检测 isMobile (window.innerWidth < 1024)
  - 移动端顶部导航栏 + 可折叠侧边栏
  - PC 端固定侧边栏
  - 响应式内容区域 padding
- [ ] M4.2: 应用 AdminLayout 到所有管理页面
  - admin/page.tsx
  - admin/products/page.tsx
  - admin/knowledge/page.tsx
  - admin/customers/page.tsx
  - admin/orders/page.tsx
  - admin/import/page.tsx
  - admin/chat/page.tsx
  - admin/settings/page.tsx

### M5: 移动端组件适配
- [ ] M5.1: 创建 MobileProductCard 组件
  - 移动端卡片视图 (hidden lg:block)
  - 底部 Sheet 弹出操作菜单
  - 响应式信息展示
- [ ] M5.2: 修改 StatCard 响应式样式
  - 移动端自适应尺寸和间距
  - 左侧强调色边框
- [ ] M5.3: 移动端表单 Sheet
  - 从底部滑入的编辑表单
  - 固定底部保存按钮
  - 增大表单字段触控区域 (h-12)

### M6: 触控交互优化
- [ ] M6.1: 触控区域 CSS (`globals.css`)
  - 移动端 min-height: 44px for interactive elements
  - 表格行 min-height: 56px
- [ ] M6.2: 滑动操作 (可选)
  - 左滑显示操作按钮
  - 使用 react-swipeable 库
- [ ] M6.3: 下拉刷新 Hook (`usePullToRefresh.ts`)
  - 下拉超过 60px 触发刷新
  - 显示 loading 状态

## Phase 3: 功能增强

### M7: 批量操作功能
- [ ] M7.1: 添加批量选择状态
  - Set<string> 存储选中 ID
  - 全选/取消全选
- [ ] M7.2: 创建 BatchActionBar 组件
  - 固定底部浮动操作栏
  - 批量上架/下架/删除按钮
- [ ] M7.3: 创建批量 API (`/api/products/batch/route.ts`)
  - POST 支持 publish/unpublish/delete 操作
  - 返回操作结果统计

### M8: 表单体验增强
- [ ] M8.1: 创建 useFormValidation Hook
  - 即时字段验证
  - touched 状态追踪
  - 返回 isValid 状态
- [ ] M8.2: 创建 useKeyboardShortcuts Hook
  - 支持 Cmd/Ctrl + S 保存
  - 支持 Cmd/Ctrl + N 新建
  - 支持 Escape 关闭对话框

### M9: 无障碍访问
- [ ] M9.1: Dialog ARIA 属性
  - role="dialog"
  - aria-labelledby
  - aria-modal
- [ ] M9.2: Table ARIA 属性
  - role="grid"
  - columnheader/sort
  - 键盘导航支持

## Phase 4: 测试与验证

- [ ] 构建验证: `npm run build`
- [ ] 移动端断点测试 (428px, 393px)
- [ ] 触控交互测试
- [ ] 性能基准测试
- [ ] 更新 package.json 版本号为 0.4.1

---

## 任务依赖关系

```
M1.1 → M1.2
M2.1 → M2.2 → M2.3
M4.1 → M4.2
M4.2 → M5.1 → M5.2 → M5.3
M3.1 → M3.2
M3.2 → M7.1 → M7.2 → M7.3
M5.3 → M8.1
M7.2 → M9.1
```

---

## 实施顺序建议

1. **M1 (Dashboard API)** - 最快见效
2. **M2 (缓存)** - 后端基础设施
3. **M4 (布局框架)** - 移动端基础
4. **M5 (组件适配)** - UI 层
5. **M3 (渲染优化)** - 性能
6. **M7 (批量操作)** - 功能
7. **M8 (表单增强)** - 体验
8. **M6 (触控)** - 移动端优化
9. **M9 (无障碍)** - 收尾

---

*版本: v0.4.1*
*创建日期: 2026-03-24*
