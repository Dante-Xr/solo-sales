# Tasks
- [x] Task 1: 实现商品搜索框与历史记录功能: 在轮播图区域添加搜索框，支持 localStorage 存储最新3条搜索历史。
  - [x] SubTask 1.1: 创建 `src/components/storefront/SearchBox.tsx` 组件
  - [x] SubTask 1.2: 实现搜索历史 storage 逻辑（max 3条，新条目优先）
  - [x] SubTask 1.3: 在 `src/app/page.tsx` 中集成 SearchBox 组件
- [x] Task 2: 实现轮播图自动播放功能: 轮播图每10秒自动切换下一张，用户操作后重置计时器。
  - [x] SubTask 2.1: 修改现有轮播组件或使用 useEffect 管理 auto-play timer
  - [x] SubTask 2.2: 实现 timer reset 逻辑（点击箭头时）
- [x] Task 3: 添加轮播图左右箭头导航按钮: 在图片左右边缘显示上一张/下一张图标。
  - [x] SubTask 3.1: 在轮播组件中添加左右箭头图标按钮
  - [x] SubTask 3.2: 实现箭头点击切换逻辑

# Task Dependencies
- [Task 2] and [Task 3] depend on existing carousel component structure (can be executed in parallel after Task 1)
