<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Order Checkout And Payments Tasks

## Phase 1: Discovery And Boundaries

- Read `src/app/api/orders/route.ts`.
- Read `order-service`, `order-repository`, `payment-service`, and `src/server/payments/stripe.ts`.
- Confirm current PayPal status.

## Phase 2: Implementation Requirements

- Define order input, server calculation, inventory decrement, and idempotency key behavior.
- Define Stripe checkout, webhook signature verification, and payment record deduplication.
- Define real PayPal integration requirements.
- Define insufficient stock, payment failure, repeated webhook, and configuration error behavior.

## Phase 3: Tests And Verification

- Test that client prices are ignored.
- Test concurrent inventory decrement and insufficient stock.
- Test repeated `Idempotency-Key`.
- Test repeated webhook does not duplicate Payment records.

## Phase 4: Documentation And Handoff

- Document the main transaction flow and direct-payment order backfill differences.
- State that all monetary fields use Decimal.

