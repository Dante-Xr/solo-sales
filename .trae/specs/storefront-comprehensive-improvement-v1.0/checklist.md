# Checklist

## Phase 1: 基础数据与页面修复

- [ ] 商品数据 seed 脚本可成功运行，数据库中至少有 20 条 Product 记录
- [ ] HomeCarousel 组件不再包含硬编码 FEATURED_PRODUCTS，数据从 props/API 获取
- [ ] ProductGrid 组件从 API 获取商品数据，不再依赖 HomeCarousel 的导出
- [ ] Featured Products API (`/api/products/featured`) 从数据库返回真实数据
- [ ] Footer 中"关于我们"、"FAQ"、"隐私政策"链接均可正常跳转到对应页面
- [ ] About 页面包含基础品牌介绍内容和 SEO metadata
- [ ] FAQ 页面包含至少 5 个常见问题 Q&A
- [ ] Privacy 页面包含 GDPR/CCPA 合规相关文本
- [ ] ProductGrid 加载时显示 6 个 Skeleton 卡片占位符
- [ ] 订单列表页加载时显示 Skeleton 行
- [ ] Sonner Toast 组件已安装并在 layout.tsx 中配置 Toaster
- [ ] 结账流程中使用 `toast.success()` 替代 `alert()` 弹窗

## Phase 2: 核心功能增强

- [ ] 订单确认页 `/orders/confirmation/[id]` 可正常访问并展示订单信息
- [ ] 订单确认页展示：订单号、商品清单、总价、支付状态、预计送达时间
- [ ] 结账成功后自动跳转至订单确认页（非 alert 提示）
- [ ] 订单确认页包含"继续购物"和"查看订单详情"按钮
- [ ] Stripe API 路由支持通过环境变量切换 test/live mode
- [ ] `.env.example` 包含所有必需的环境变量说明
- [ ] PayPal Mock 模式有明确的演示模式标识

## Phase 3: 首页 Server Component 化

- [ ] 首页 `page.tsx` 不再标记 `"use client"`
- [ ] 首页 HTML 在服务端渲染（查看源代码可见完整 HTML 内容）
- [ ] HomeCarouselClient 正确处理轮播交互（自动播放、点击切换）
- [ ] ProductGridClient 正确处理商品卡片点击跳转
- [ ] SearchBoxClient 正确处理搜索输入和历史记录
- [ ] `npm run build` 无 SSR/hydration 相关错误
- [ ] 首页 Lighthouse Performance 分数 > 80（如有条件测试）

## Phase 4: 商品评价系统

- [ ] Prisma Review 模型已创建且迁移成功（`prisma migrate status` 显示最新）
- [ ] GET `/api/reviews?productId=xxx` 返回该商品的评论列表和平均分
- [ ] POST `/api/reviews` 可成功提交评价（需登录状态验证）
- [ ] ProductReviews 组件显示：平均分星级 + 评分分布 + 评论列表
- [ ] "撰写评价"表单可正常提交（1-5 星级选择 + 文字评论）
- [ ] 每用户对每商品只能评价一次（唯一约束生效）
- [ ] 商品详情页正确集成 ProductReviews 组件

## Phase 5: 商品详情页完善

- [ ] ImageGallery 支持主图 + 缩略图切换
- [ ] 点击缩略图可切换主图显示
- [ ] VariantSelector 支持颜色/尺寸选择，选中后 UI 有明确反馈
- [ ] 选择不同规格后价格正确联动更新（如有 variant 价格差异）
- [ ] RelatedProducts 展示同品类其他商品（排除当前商品）
- [ ] 商品详情页布局：左侧图片画廊，右侧信息区
- [ ] 双 CTA 按钮存在："加入购物车" 和 "立即购买"
- [ ] 商品详情页移动端响应式布局正常

## Phase 6: 紧迫感元素

- [ ] CountdownTimer 组件正确显示倒计时（天:时:分:秒 格式）
- [ ] 倒计时到达 0 时显示"已结束"或隐藏
- [ ] StockBadge 在库存 <= 10 时显示红色"仅剩 X 件"
- [ ] StockBadge 在库存 <= 50 且 > 10 时显示"库存紧张"
- [ ] StockBadge 在库存 > 50 时不显示
- [ ] RecentPurchases 组件在页面底部滚动显示购买通知
- [ ] 购买通知每约 5 秒切换一条新通知
- [ ] ProductCard 中集成了 StockBadge 显示

## Phase 7: 安全增强

- [ ] CSP 响应头中 script-src 使用 nonce 而非 'unsafe-inline'
- [ ] 每个 `<script>` 标签携带正确的 nonce 属性
- [ ] 内联脚本在 nonce CSP 下正常执行
- [ ] 第三方脚本（如 Stripe.js）在 nonce CSP 下正常加载
- [ ] POST `/api/orders` 无 CSRF Token 时返回 403
- [ ] POST `/api/orders` 携带有效 CSRF Token 时正常处理
- [ ] POST `/api/checkout/stripe` CSRF 验证正常工作
- [ ] POST `/api/reviews` CSRF 验证正常工作
- [ ] 前端表单自动注入 CSRF Token 隐藏字段
- [ ] useCsrfToken Hook 可正确获取和管理 Token 生命周期

## 全局验证

- [ ] `npm run build` 完全通过，无错误无警告
- [ ] `npm run lint` 通过（如有配置）
- [ ] TypeScript 类型检查通过
- [ ] 手动测试核心流程：首页浏览 → 商品详情 → 加入购物车 → 结账 → 订单确认
- [ ] 移动端视口下所有页面响应式布局正常
- [ ] 暗色/亮色主题切换在所有新增页面正常工作
- [ ] 中英文切换在所有新增页面正常工作
- [ ] 未登录用户可使用访客结账功能
- [ ] 已登录用户结账时自动填充邮箱信息
