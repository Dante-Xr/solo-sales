# Tasks
- [x] Task 1: 创建后端支付接口: 实现 Stripe 和 PayPal 的服务端会话生成逻辑。
  - [x] SubTask 1.1: 创建 Stripe Checkout Session API (`src/app/api/checkout/stripe/route.ts`)。
  - [x] SubTask 1.2: 创建 PayPal Order API (`src/app/api/checkout/paypal/route.ts`)。
- [x] Task 2: 构建前端结账组件: 实现包含表单与支付按钮的 UI。
  - [x] SubTask 2.1: 创建收件信息表单组件。
  - [x] SubTask 2.2: 集成 Stripe 支付跳转按钮。
  - [x] SubTask 2.3: 集成 PayPal 智能按钮组件。
- [x] Task 3: 联调前台购买主流程: 将“立即购买”按钮与结账组件连接。
  - [x] SubTask 3.1: 在 `src/app/page.tsx` 中引入并触发结账流程。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
