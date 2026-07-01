# PayPal API 端点文档

**版本**: v1.7.3  
**基础URL**: `http://localhost:3000` (开发) / `https://yourdomain.com` (生产)

---

## 端点列表

### 1. 创建 PayPal 支付会话

创建 PayPal 订单并返回支付链接。

**端点**: `POST /api/checkout/paypal`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "orderId": "string",     // 必填：订单ID
  "locale": "string"       // 可选：语言代码（默认 "en"）
}
```

**响应 - 成功** (200):
```json
{
  "success": true,
  "redirectUrl": "https://www.sandbox.paypal.com/checkoutnow?token=xxx",
  "orderId": "cmqy1ol460002fb2n7z6cwa5o"
}
```

**响应 - 错误** (400/404/500):
```json
{
  "error": "错误描述",
  "details": "详细信息（可选）"
}
```

**示例**:
```bash
curl -X POST http://localhost:3000/api/checkout/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "cmqy1ol460002fb2n7z6cwa5o",
    "locale": "en"
  }'
```

---

### 2. 捕获 PayPal 支付

用户从 PayPal 返回后，捕获支付并更新订单状态。

**端点**: `GET /api/checkout/paypal/capture`

**查询参数**:
- `token` (必填): PayPal 返回的订单 token

**响应 - 成功** (200):
```json
{
  "success": true,
  "orderId": "cmqy1ol460002fb2n7z6cwa5o",
  "message": "支付成功",
  "transactionId": "0F0364282X358625C"
}
```

**响应 - 已处理** (200):
```json
{
  "success": true,
  "orderId": "cmqy1ol460002fb2n7z6cwa5o",
  "message": "订单已支付",
  "alreadyProcessed": true
}
```

**响应 - 错误** (400/404/500):
```json
{
  "error": "错误描述",
  "details": "详细信息"
}
```

**示例**:
```bash
curl "http://localhost:3000/api/checkout/paypal/capture?token=14P14395CR299293J"
```

---

### 3. PayPal Webhook 处理

接收 PayPal 的异步通知事件。

**端点**: `POST /api/webhooks/paypal`

**请求头**:
```
Content-Type: application/json
paypal-transmission-id: string
paypal-transmission-time: string
paypal-transmission-sig: string
paypal-cert-url: string
paypal-auth-algo: string
```

**请求体**: PayPal 事件 JSON（由 PayPal 发送）

**支持的事件类型**:
- `PAYMENT.CAPTURE.COMPLETED` - 支付成功
- `PAYMENT.CAPTURE.DENIED` - 支付失败
- `CHECKOUT.ORDER.APPROVED` - 订单批准

**响应 - 成功** (200):
```json
{
  "success": true,
  "message": "Payment processed successfully"
}
```

**响应 - 重复** (200):
```json
{
  "success": true,
  "message": "Webhook already processed",
  "duplicate": true
}
```

**响应 - 错误** (401/404/500):
```json
{
  "error": "错误描述",
  "details": "详细信息"
}
```

**配置 Webhook**:
1. 访问 https://developer.paypal.com/dashboard/
2. 进入 Apps & Credentials → 你的应用 → Webhooks
3. 添加 Webhook URL: `https://yourdomain.com/api/webhooks/paypal`
4. 选择事件类型（见上方）
5. 保存并复制 Webhook ID 到 `PAYPAL_WEBHOOK_ID` 环境变量

---

## 错误代码

| HTTP 状态码 | 错误描述 | 原因 |
|------------|---------|------|
| 400 | 缺少订单号 | 请求未提供 orderId |
| 400 | 订单状态不正确 | 订单不是 PENDING 状态 |
| 401 | Webhook 验证失败 | 签名验证不通过 |
| 404 | 订单不存在 | 数据库中找不到订单 |
| 500 | PayPal 配置未完成 | 缺少环境变量 |
| 500 | PayPal 未启用 | ENABLED_PAYMENT_PROVIDERS 未包含 paypal |
| 501 | 不支持的事件类型 | Webhook 事件类型未处理 |

---

## 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `PAYPAL_CLIENT_ID` | ✅ | PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | ✅ | PayPal Secret |
| `PAYPAL_MODE` | ✅ | sandbox 或 live |
| `PAYPAL_WEBHOOK_ID` | 推荐 | Webhook ID（用于签名验证）|
| `ENABLED_PAYMENT_PROVIDERS` | ✅ | 必须包含 "paypal" |
| `NEXT_PUBLIC_APP_URL` | ✅ | 应用 URL（用于回调）|

---

## 支付流程

```
1. 用户创建订单（POST /api/orders）
   ↓
2. 调用创建支付 API（POST /api/checkout/paypal）
   ↓
3. 获取 PayPal 支付链接
   ↓
4. 用户跳转到 PayPal 支付
   ↓
5. 用户完成支付
   ↓
6. PayPal 重定向回网站（带 token）
   ↓
7. 自动调用捕获 API（GET /api/checkout/paypal/capture?token=xxx）
   ↓
8. 订单状态更新为 PAID
   ↓
9. 创建支付记录
   ↓
10. 显示支付成功页面
```

---

## 安全性

### 1. 订单验证
- ✅ 订单必须存在于数据库
- ✅ 订单状态必须是 PENDING
- ✅ 订单金额从数据库查询（不信任客户端）

### 2. Webhook 验证
- ✅ 签名验证（需要配置 PAYPAL_WEBHOOK_ID）
- ✅ 幂等性检查（防止重复处理）
- ✅ 事件类型白名单

### 3. 环境变量保护
- ✅ API 密钥存储在环境变量
- ✅ 不暴露给客户端
- ✅ 不提交到 Git

---

## 测试

### Sandbox 测试
```bash
# 1. 配置 Sandbox 凭证
PAYPAL_CLIENT_ID=sandbox_client_id
PAYPAL_CLIENT_SECRET=sandbox_secret
PAYPAL_MODE=sandbox

# 2. 创建测试订单
POST /api/orders

# 3. 创建支付
POST /api/checkout/paypal
Body: {"orderId": "xxx", "locale": "en"}

# 4. 使用 PayPal 测试账户完成支付
# 从 https://developer.paypal.com/dashboard/accounts 获取测试账户
```

### 测试卡（无需登录）
```
卡号: 4032039881915307
到期: 12/2025
CVV: 123
```

---

## 限制和注意事项

### 速率限制
- Sandbox: 标准 API 限制
- Live: 根据账户类型而定

### 支付限制
- 最小金额: $0.01
- 最大金额: 根据账户设置

### 货币支持
- 当前仅支持 USD
- 可扩展支持其他货币

### 超时时间
- PayPal 支付会话: 3 小时
- 未完成的订单不会自动取消

---

## 相关文档

- [PayPal 完整集成指南](./paypal-integration-guide.md)
- [PayPal 快速开始](./paypal-quick-start.md)
- [PayPal REST API 官方文档](https://developer.paypal.com/docs/api/overview/)

---

**更新时间**: 2026-06-30  
**维护者**: SoloSales Team
