# Tasks
- [x] Task 1: 设置全局购物车状态管理: 创建 React Context 用于跨组件共享购物车数据（添加商品、修改数量、删除商品）。
  - [x] SubTask 1.1: 创建 `src/context/CartContext.tsx` 并实现基本逻辑。
  - [x] SubTask 1.2: 在 `src/app/layout.tsx` 中引入并包裹应用。
- [x] Task 2: 实现首页商品轮播图: 在首页顶部添加自动轮播组件，展示多款商品。
  - [x] SubTask 2.1: 安装或引入轮播图组件（可使用 Shadcn 的 Carousel 或其他库）。
  - [x] SubTask 2.2: 在 `src/app/page.tsx` 中使用轮播组件展示 Mock 商品列表。
- [x] Task 3: 创建商品详情页: 实现独立的商品展示和"加入购物车"逻辑。
  - [x] SubTask 3.1: 创建 `src/app/product/[id]/page.tsx` 动态路由。
  - [x] SubTask 3.2: 页面内包含商品大图、价格、描述，以及连接到 Context 的"加入购物车"按钮。
- [x] Task 4: 实现购物车页面: 展示已选商品并计算总价。
  - [x] SubTask 4.1: 创建 `src/app/cart/page.tsx`。
  - [x] SubTask 4.2: 渲染购物车商品列表，支持数量增减和删除。
  - [x] SubTask 4.3: 底部悬浮栏显示总价和"去结算"按钮（暂时弹窗或跳转到结账流程）。

# Task Dependencies
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 1]
- [Task 2] can be executed independently but links to [Task 3]
