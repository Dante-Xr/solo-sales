# PayPal 快速配置指南（5 分钟）

## 🚀 快速开始

### 1️⃣ 注册 PayPal Business 账户（个体经营者）

访问 https://www.paypal.com → Sign Up → Business Account → **Individual/Sole Proprietor**

✅ 无需营业执照，使用个人身份即可

---

### 2️⃣ 获取 API 凭证

1. 登录 https://developer.paypal.com/dashboard/
2. Apps & Credentials → Sandbox
3. 复制 **Client ID** 和 **Secret**

---

### 3️⃣ 配置环境变量

在 `.env.local` 添加：

```env
# PayPal 配置
PAYPAL_CLIENT_ID=AeA1QIZXiflr1_w7Jk3pGfiMDq_ufHIBnN6B4vSjXM9tOw5nU_XMFXxJbDRNVK8Z1m9kDdEKE4HvC8w5
PAYPAL_CLIENT_SECRET=EBzC4J_qdBBvp2FNaJQJMOqF_XhQbZv3j0aSF9ztOcKTjC_Q4pJmq3kGQmLqJNvXU6Fq4Tq_hQ7MhWRb
PAYPAL_MODE=sandbox

# 启用 PayPal
ENABLED_PAYMENT_PROVIDERS=stripe,alipay,wechatpay,paypal

# 应用 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 4️⃣ 重启服务器

```bash
npm run dev
```

---

### 5️⃣ 测试支付

#### 在订单确认页面添加 PayPal 按钮：

```tsx
import { PayPalButton } from '@/components/checkout/PayPalButton'

<PayPalButton
  orderId={order.id}
  amount={order.totalAmount}
  locale="en"
/>
```

#### 使用测试账户：

1. 访问 https://developer.paypal.com/dashboard/accounts
2. 找到 Personal 类型的测试账户
3. 查看邮箱和密码
4. 在支付时登录该测试账户

---

## ✅ 完成！

现在你可以：
- 创建订单
- 点击 PayPal 按钮
- 使用测试账户支付
- 自动返回成功页面

---

## 🔧 配置 Webhook（可选但推荐）

### 为什么需要 Webhook？
即使用户关闭浏览器，PayPal 也能通知你支付结果。

### 配置步骤：

1. Developer Dashboard → Apps → 你的应用 → Webhooks
2. Add Webhook
3. URL: `https://yourdomain.com/api/webhooks/paypal`
4. 选择事件：
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.DENIED
   - CHECKOUT.ORDER.APPROVED
5. 复制 Webhook ID
6. 添加到 `.env.local`：
   ```env
   PAYPAL_WEBHOOK_ID=your_webhook_id_here
   ```

---

## 📝 上线前清单

- [ ] 切换到 Live 模式
- [ ] 获取生产 API 凭证
- [ ] 更新 `PAYPAL_MODE=live`
- [ ] 配置生产 Webhook
- [ ] 使用真实账户测试小额支付

---

## 🆘 遇到问题？

查看完整指南：[PayPal Integration Guide](./paypal-integration-guide.md)

常见问题：
- **"not configured"** → 检查环境变量
- **"not enabled"** → 检查 ENABLED_PAYMENT_PROVIDERS
- **支付后没反应** → 查看浏览器控制台错误

---

**5 分钟搞定 PayPal 集成！🎉**
