# PayPal Business 集成指南

**版本**: v1.7.3  
**创建时间**: 2026-06-30  
**支持账户类型**: PayPal Business (Sole Proprietor) - 无需营业执照

---

## 📋 目录

1. [功能概述](#功能概述)
2. [注册 PayPal Business 账户](#注册-paypal-business-账户)
3. [配置步骤](#配置步骤)
4. [测试](#测试)
5. [上线](#上线)
6. [故障排查](#故障排查)

---

## 功能概述

### ✅ 已实现功能

1. **PayPal Checkout 集成** - 用户跳转到 PayPal 完成支付
2. **支付确认** - 用户支付后自动返回并确认订单
3. **Webhook 处理** - 接收 PayPal 的支付通知
4. **订单状态更新** - 自动更新订单为已支付
5. **支付记录** - 记录所有支付交易
6. **重复通知检测** - 幂等性处理，防止重复记账

### 支持的支付方式

- ✅ PayPal 账户余额
- ✅ 绑定的银行卡
- ✅ 信用卡/借记卡（无需 PayPal 账户）
- ✅ 国际支付（200+ 国家）

---

## 注册 PayPal Business 账户

### 方案一：个体经营者（推荐 - 无需营业执照）

#### 步骤 1: 访问 PayPal 官网
```
https://www.paypal.com
```

#### 步骤 2: 注册商业账户
1. 点击 "Sign Up" → "Business Account"
2. 账户类型选择 **"Individual/Sole Proprietor"**
3. 填写个人信息：
   - 姓名
   - 邮箱
   - 电话号码
   - 地址

#### 步骤 3: 验证账户
1. 绑定银行账户
2. 上传身份证明（护照/驾照）
3. 完成小额验证（PayPal 会向你的银行账户打入小额款项）

#### 步骤 4: 获取 API 凭证
1. 登录 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. 进入 "Apps & Credentials"
3. 切换到 "Sandbox" 模式（测试环境）
4. 创建应用或使用默认应用
5. 复制以下信息：
   - **Client ID**
   - **Secret**

---

## 配置步骤

### 步骤 1: 安装依赖

依赖已安装：
```json
{
  "@paypal/checkout-server-sdk": "^1.0.3"
}
```

### 步骤 2: 配置环境变量

创建或编辑 `.env.local` 文件：

```env
# PayPal 配置
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_MODE=sandbox  # sandbox（测试）或 live（生产）

# 启用 PayPal 支付提供商
ENABLED_PAYMENT_PROVIDERS=stripe,alipay,wechatpay,paypal

# 应用 URL（用于支付回调）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 步骤 3: 配置 Webhook（可选但推荐）

1. 登录 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. 进入 "Apps & Credentials" → 选择你的应用
3. 滚动到 "Webhooks" 部分
4. 点击 "Add Webhook"
5. 填写 Webhook URL：
   ```
   https://yourdomain.com/api/webhooks/paypal
   ```
6. 选择事件类型：
   - ✅ `PAYMENT.CAPTURE.COMPLETED`
   - ✅ `PAYMENT.CAPTURE.DENIED`
   - ✅ `CHECKOUT.ORDER.APPROVED`
7. 保存后复制 **Webhook ID**
8. 添加到 `.env.local`：
   ```env
   PAYPAL_WEBHOOK_ID=your_webhook_id_here
   ```

---

## 测试

### 步骤 1: 启动开发服务器

```bash
npm run dev
```

### 步骤 2: 创建测试订单

1. 登录网站
2. 添加商品到购物车
3. 进入结账页面
4. 填写收货信息
5. 创建订单

### 步骤 3: 测试 PayPal 支付

#### 方法 A: 使用 PayPalButton 组件

在订单确认页面添加：

```tsx
import { PayPalButton } from '@/components/checkout/PayPalButton'

<PayPalButton
  orderId="your_order_id"
  amount={100}
  locale="en"
  onSuccess={() => {
    console.log('支付成功')
  }}
  onError={(error) => {
    console.error('支付失败:', error)
  }}
/>
```

#### 方法 B: 直接调用 API

```javascript
const response = await fetch('/api/checkout/paypal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'your_order_id',
    locale: 'en'
  })
})

const data = await response.json()

if (data.redirectUrl) {
  window.location.href = data.redirectUrl
}
```

### 步骤 4: 使用 PayPal 测试账户

PayPal Sandbox 提供测试账户：

1. 登录 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. 进入 "Sandbox" → "Accounts"
3. 找到 "Personal" 类型的测试账户
4. 点击 "..." → "View/Edit Account"
5. 复制邮箱和密码
6. 在支付时使用这些凭证登录

**测试信用卡**（无需 PayPal 账户）：
```
卡号: 4032039881915307
到期: 任意未来日期
CVV: 任意 3 位数字
```

### 步骤 5: 验证结果

#### 支付成功流程：
1. 用户点击 PayPal 按钮
2. 跳转到 PayPal 支付页面
3. 完成支付
4. 返回到 `/payment/success?provider=paypal&token=xxx`
5. 订单状态更新为 `PAID`
6. 创建支付记录

#### 检查数据库：

```sql
-- 检查订单状态
SELECT id, status, totalAmount FROM "Order" WHERE id = 'your_order_id';

-- 检查支付记录
SELECT * FROM "Payment" WHERE orderId = 'your_order_id';
```

---

## 上线

### 步骤 1: 切换到生产环境

1. 登录 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. 切换到 **"Live"** 模式（右上角开关）
3. 获取生产环境的 API 凭证
4. 更新 `.env.production` 或生产服务器环境变量：

```env
PAYPAL_CLIENT_ID=live_client_id_here
PAYPAL_CLIENT_SECRET=live_client_secret_here
PAYPAL_MODE=live
PAYPAL_WEBHOOK_ID=live_webhook_id_here

ENABLED_PAYMENT_PROVIDERS=stripe,alipay,wechatpay,paypal

NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 步骤 2: 配置生产 Webhook

1. 在 Live 模式下重复 [配置 Webhook](#步骤-3-配置-webhook可选但推荐) 步骤
2. 使用生产域名：
   ```
   https://yourdomain.com/api/webhooks/paypal
   ```

### 步骤 3: 测试生产环境

⚠️ **使用真实支付测试，建议使用小额订单（$0.01）**

1. 创建真实订单
2. 使用真实 PayPal 账户或信用卡支付
3. 验证支付成功
4. 检查 Webhook 是否正常接收
5. 申请退款测试（可选）

---

## API 端点

### 创建支付

```
POST /api/checkout/paypal
Content-Type: application/json

{
  "orderId": "clxxx...",
  "locale": "en"
}

响应：
{
  "success": true,
  "redirectUrl": "https://www.sandbox.paypal.com/checkoutnow?token=xxx",
  "orderId": "clxxx..."
}
```

### 捕获支付（自动调用）

```
GET /api/checkout/paypal/capture?token=xxx

响应：
{
  "success": true,
  "orderId": "clxxx...",
  "message": "支付成功",
  "transactionId": "xxx"
}
```

### Webhook 处理

```
POST /api/webhooks/paypal
Headers:
  paypal-transmission-id: xxx
  paypal-transmission-time: xxx
  paypal-transmission-sig: xxx
  paypal-cert-url: xxx
  paypal-auth-algo: xxx

Body: PayPal 事件 JSON

响应：
{
  "success": true,
  "message": "Payment processed successfully"
}
```

---

## 故障排查

### 问题 1: "PAYPAL_CLIENT_ID is not configured"

**原因**: 环境变量未配置  
**解决**:
1. 检查 `.env.local` 是否包含 `PAYPAL_CLIENT_ID` 和 `PAYPAL_CLIENT_SECRET`
2. 重启开发服务器
3. 确认环境变量已加载：
   ```bash
   echo $PAYPAL_CLIENT_ID
   ```

### 问题 2: "Payment provider paypal is not enabled"

**原因**: PayPal 未在启用列表中  
**解决**:
```env
ENABLED_PAYMENT_PROVIDERS=stripe,alipay,wechatpay,paypal
```

### 问题 3: PayPal 返回错误 "INVALID_REQUEST"

**原因**: 请求参数格式错误  
**检查**:
- `amount` 必须是数字且大于 0
- `currency` 必须是有效的货币代码（如 USD、EUR）
- `orderId` 必须存在于数据库中

### 问题 4: Webhook 验证失败

**原因**: Webhook 签名验证失败  
**解决**:
1. 确认 `PAYPAL_WEBHOOK_ID` 正确
2. 检查 Webhook URL 是否可公开访问（生产环境）
3. 本地测试使用 ngrok 等工具暴露本地端口：
   ```bash
   ngrok http 3000
   ```

### 问题 5: 支付成功但订单未更新

**检查**:
1. 查看服务器日志中的 Webhook 事件
2. 检查数据库是否有支付记录
3. 验证 `orderId` 是否正确传递：
   ```javascript
   console.log('PayPal Order:', paypalOrder.purchase_units[0].custom_id)
   ```

### 问题 6: 测试账户无法登录

**解决**:
1. 在 PayPal Developer Dashboard 重置测试账户密码
2. 或创建新的测试账户
3. 确认在 Sandbox 模式下操作

---

## 费用说明

### PayPal 手续费（美国）

| 交易类型 | 费率 |
|---------|------|
| 国内交易 | 2.9% + $0.30 |
| 国际交易 | 4.4% + 固定费用 |
| 货币转换 | 额外 3-4% |

**月交易量折扣**：
- $3,000 - $10,000: 2.7% + $0.30
- $10,000 - $100,000: 2.5% + $0.30
- $100,000+: 联系 PayPal 商谈

---

## 安全提示

### 生产环境清单

- [ ] 使用 HTTPS（PayPal 要求）
- [ ] 保护 API 密钥（不提交到 Git）
- [ ] 配置 Webhook 签名验证
- [ ] 启用订单金额验证
- [ ] 实施重复通知检测（已实现）
- [ ] 记录所有支付事件
- [ ] 设置支付金额限制
- [ ] 定期审查交易日志

### 常见安全问题

❌ **不要**:
- 将 API 密钥硬编码到代码中
- 跳过 Webhook 签名验证
- 信任客户端传递的金额
- 在客户端暴露 Secret

✅ **要**:
- 使用环境变量存储密钥
- 验证所有 Webhook 签名
- 从数据库查询订单金额
- 记录所有异常事件

---

## 支持与帮助

### 官方资源

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal REST API Reference](https://developer.paypal.com/docs/api/overview/)
- [PayPal Webhooks Guide](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)

### 常用工具

- [PayPal Sandbox](https://www.sandbox.paypal.com/) - 测试环境
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) - 管理应用和凭证
- [Webhook Simulator](https://developer.paypal.com/dashboard/webhooks/simulate) - 测试 Webhook

---

## 下一步

1. **集成完整的订单状态机** - 支付成功后自动扣减库存
2. **邮件通知** - 支付成功后发送确认邮件
3. **退款功能** - 支持部分或全额退款
4. **订阅支付** - 支持定期付款
5. **多货币支持** - 根据用户地区自动选择货币

---

**集成完成！🎉 您的独立站现在支持 PayPal 支付了！**
