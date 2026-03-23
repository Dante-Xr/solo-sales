# Tasks

## Task 1: 创建演示页面基础路由

创建 `src/app/demo/page.tsx`，作为演示页面的入口文件。

- [x] SubTask 1.1: 创建 demo 目录结构
- [x] SubTask 1.2: 创建基础页面框架，引入布局组件
- [x] SubTask 1.3: 添加演示模式横幅组件

## Task 2: 实现演示页面布局

实现演示页面的完整布局，复用现有 storefront 组件。

- [x] SubTask 2.1: 添加顶部导航栏（Logo、搜索框、购物车图标）
- [x] SubTask 2.2: 嵌入 HomeCarousel 轮播组件
- [x] SubTask 2.3: 添加热搜词显示区域
- [x] SubTask 2.4: 添加商品网格展示区域

## Task 3: 实现购物车功能

在演示页面中实现购物车相关功能。

- [x] SubTask 3.1: 添加购物车状态管理（使用 CartContext）
- [x] SubTask 3.2: 添加底部购物车悬浮栏
- [x] SubTask 3.3: 实现加入购物车按钮
- [x] SubTask 3.4: 显示购物车数量角标

## Task 4: 实现结账流程（演示模式）

实现只读的结账流程提示。

- [x] SubTask 4.1: 创建结账弹窗组件
- [x] SubTask 4.2: 添加"演示模式"提示文案
- [x] SubTask 4.3: 禁用真实的结账提交操作

## Task 5: 添加演示模式标识

在页面显眼位置添加演示环境标识。

- [x] SubTask 5.1: 添加顶部黄色横幅
- [x] SubTask 5.2: 添加结账时的演示提示 Toast

## Task 6: 验证和测试

验证演示页面的功能和显示效果。

- [x] SubTask 6.1: 测试页面加载和渲染（代码已创建，无 TypeScript 错误）
- [ ] SubTask 6.2: 测试轮播图自动播放
- [ ] SubTask 6.3: 测试搜索功能
- [ ] SubTask 6.4: 测试购物车添加/显示
- [ ] SubTask 6.5: 测试夜间模式切换

# Task Dependencies

- Task 1 完成后才能开始 Task 2 ✓
- Task 2 完成后才能开始 Task 3 ✓
- Task 3 完成后才能开始 Task 4 ✓
- Task 5 可与 Task 2-4 并行进行 ✓
- Task 6 需在所有任务完成后执行（部分验证：代码质量检查通过）
