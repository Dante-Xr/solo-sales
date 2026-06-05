-- 修改时间：2026-06-04 16:40:36 +08:00
-- 修改内容：新增支付 provider + transactionId 唯一索引，支撑 Stripe Webhook 并发幂等。
-- 修改模型：gpt-5.5

-- CreateIndex
CREATE UNIQUE INDEX "Payment_provider_transactionId_key" ON "Payment"("provider", "transactionId");
