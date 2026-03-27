# Tasks - 首页点击功能修复 v0.8.1

## 任务列表

- [ ] Task 1: 恢复 HomeCarousel.tsx 的 Image 组件
  - [ ] SubTask 1.1: 移除 pointer-events-none，恢复为 `className="object-cover"`
  - [ ] SubTask 1.2: 确保轮播卡片 onClick 正常工作

- [ ] Task 2: 恢复 ProductGrid.tsx 的 Image 组件
  - [ ] SubTask 2.1: 移除 pointer-events-none，恢复为 `className="object-cover transition-transform duration-300 group-hover:scale-110"`
  - [ ] SubTask 2.2: 确保商品卡片 onClick 正常工作

- [ ] Task 3: 修复 WelcomeModal.tsx 关闭按钮定位
  - [ ] SubTask 3.1: 给 modal 外层添加 position: relative
  - [ ] SubTask 3.2: 确保关闭按钮正确显示在右上角

- [ ] Task 4: 验证修复
  - [ ] SubTask 4.1: 运行 lint 检查
  - [ ] SubTask 4.2: 验证所有点击功能正常

## 任务依赖关系
- Task 1, 2, 3 可并行执行
- Task 4 依赖 Task 1, 2, 3
