# Checklist - 首页点击功能修复 v0.8.1

## 修复检查清单

### HomeCarousel.tsx 修复
- [x] 已移除 Image 组件的 pointer-events-none
- [x] 轮播卡片点击可正常跳转 `/product/{id}`

### ProductGrid.tsx 修复
- [x] 已移除 Image 组件的 pointer-events-none
- [x] 商品卡片点击可正常跳转 `/product/{id}`

### WelcomeModal.tsx 修复
- [x] 已添加 position: relative 到 modal 外层容器
- [x] 关闭按钮正确显示在右上角

### 验证检查
- [x] ESLint 检查通过 (0 errors)
- [x] 构建成功 (Redis 配置警告不影响功能)
