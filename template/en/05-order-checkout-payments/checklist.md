<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Order Checkout And Payments Checklist

## Documentation Completeness

- [ ] Orders, inventory, Stripe, webhooks, and PayPal are covered.
- [ ] State transitions are documented.

## Functional Correctness

- [ ] Amounts are computed on the server.
- [ ] Inventory is decremented in a transaction.
- [ ] Order idempotency does not decrement inventory twice.

## Data And API Contract

- [ ] `Payment(provider, transactionId)` deduplicates payments.
- [ ] Insufficient stock returns `INSUFFICIENT_STOCK`.

## Security And Permissions

- [ ] Payment APIs use CSRF, rate limiting, and server-side secrets.
- [ ] Webhooks verify raw body signatures.

## Reliability And Failure Modes

- [ ] Stripe configuration errors and provider errors are distinct.
- [ ] Repeated webhooks are safe.

## Verification Commands

- [ ] `npm test -- src/server/services/__tests__/order-service.test.ts`
- [ ] `npm test -- src/server/services/__tests__/payment-service.test.ts`

