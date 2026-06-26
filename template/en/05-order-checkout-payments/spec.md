<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Order Checkout And Payments Spec

## Purpose

Define order creation, inventory decrement, server-side amount calculation, Stripe, PayPal, webhooks, and idempotency requirements.

## Requirement: Server-Side Amount Calculation

The system SHALL ignore client-provided `price`, `totalAmount`, and `paymentStatus`. Order and payment amounts SHALL be computed by reading product prices from the database on the server.

### Scenario: Creating An Order

- WHEN a user submits `items/productId/quantity/shippingAddress/contactInfo`
- THEN the system SHALL read products, verify stock, compute amount, decrement stock, and create `Order` plus `OrderItem` records in one transaction
- AND the initial order status SHALL be `PENDING`

## Requirement: Transactional Idempotency

Order creation SHALL support `Idempotency-Key`. Repeated requests SHALL return the existing order and SHALL NOT decrement inventory twice.

## Requirement: Stripe Payments

Stripe checkout SHALL create sessions using server-side product prices. Stripe webhooks SHALL verify the raw body signature and deduplicate by `Payment(provider, transactionId)`.

## Requirement: PayPal Reproduction Requirement

PayPal is currently mock-like. A reproduced implementation SHALL treat it as a real payment integration with server-side amount calculation, order status updates, Payment records, failure handling, and webhook or capture semantics.

