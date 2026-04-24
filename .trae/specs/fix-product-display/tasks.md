# Tasks

- [x] Task 1: 创建 middleware.ts 文件
  - [x] SubTask 1.1: 在 src 目录下创建 middleware.ts
  - [x] SubTask 1.2: 配置 next-intl createMiddleware
  - [x] SubTask 1.3: 设置正确的语言匹配和重定向逻辑
  - 注：已发现项目使用 proxy.ts，已删除 middleware.ts

- [x] Task 2: 初始化数据库商品数据
  - [x] SubTask 2.1: 运行 prisma db push 同步数据库结构
  - [x] SubTask 2.2: 运行商品数据种子脚本

- [x] Task 3: 修复 Unsplash 图片 URL 404 问题
  - [x] SubTask 3.1: 将所有 Unsplash 图片 URL 替换为 picsum.photos 可靠图片源
  - [x] SubTask 3.2: 更新种子数据中的图片 URL
  - [x] SubTask 3.3: 更新首页和商品列表页的 FALLBACK_PRODUCTS 图片 URL
  - [x] SubTask 3.4: 清除 Redis 缓存中的旧数据

- [x] Task 4: 优化 ImageGallery 移动端布局
  - [x] SubTask 4.1: 主图比例改为 aspect-square md:aspect-[4/3]
  - [x] SubTask 4.2: 缩略图尺寸改为 w-16 h-16 md:w-20 md:h-20

- [x] Task 5: 添加移动端底部固定购买栏
  - [x] SubTask 5.1: 在 page.tsx 添加 fixed bottom bar (md:hidden)
  - [x] SubTask 5.2: 添加 safe-area-pb 支持 iPhone 刘海屏
  - [x] SubTask 5.3: 在 globals.css 添加 safe-area-pb 样式

- [x] Task 6: 优化按钮和价格在移动端的布局
  - [x] SubTask 6.1: 按钮改为 flex-col sm:flex-row 垂直堆叠
  - [x] SubTask 6.2: 按钮高度改为 h-12 sm:h-11
  - [x] SubTask 6.3: 价格区域添加 flex-wrap

- [x] Task 7: 添加描述折叠/展开功能
  - [x] SubTask 7.1: 添加 descExpanded state
  - [x] SubTask 7.2: 添加 line-clamp-3 和展开按钮
  - [x] SubTask 7.3: 添加 showMore/showLess 翻译键

- [x] Task 8: 优化 TrustBar 移动端布局
  - [x] SubTask 8.1: 移动端使用 grid grid-cols-2
  - [x] SubTask 8.2: PC 端保持 row 布局

- [x] Task 9: 调整移动端字体大小和间距
  - [x] SubTask 9.1: 标题改为 text-base md:text-2xl
  - [x] SubTask 9.2: 价格改为 text-xl md:text-3xl
  - [x] SubTask 9.3: 间距改为 space-y-3 md:space-y-4

- [x] Task 10: 增大 StockBadge 尺寸
  - [x] SubTask 10.1: text-[10px] 改为 text-xs
  - [x] SubTask 10.2: px-1.5 py-0.5 改为 px-2.5 py-1

- [x] Task 11: 验证所有移动端优化效果
  - [x] SubTask 11.1: 启动开发服务器
  - [x] SubTask 11.2: 验证商品详情页移动端布局
  - [x] SubTask 11.3: 确认无 console 错误

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4-10] can be done in parallel
- [Task 11] depends on [Task 4-10]
