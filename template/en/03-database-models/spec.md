<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Database Models And State Machines Spec

## Purpose

Define SoloSales data domains, relationships, unique constraints, indexes, state machines, and transactional consistency requirements.

## Requirement: Core Data Domains

The system SHALL cover user auth, products, orders and payments, coupons, points, RBAC, knowledge base and support chat, imports and inventory, background jobs, affiliates, bundles, and email sequences.

### Scenario: Rebuilding Prisma Models

- WHEN AI reproduces the database
- THEN it SHALL reproduce core models, enums, relationships, unique constraints, and major indexes
- AND monetary fields SHALL use Decimal, not JavaScript float, as the source of truth

## Requirement: Transactional Consistency

Orders, payments, inventory, coupons, and points SHALL define transaction boundaries and concurrency failure behavior.

### Scenario: Creating An Order

- WHEN a user creates an order
- THEN the system SHALL read published products, compute totals, verify stock, conditionally decrement stock, and create Order plus OrderItem records in one transaction
- AND insufficient stock SHALL return `INSUFFICIENT_STOCK`

## Current Gaps

- PayPal is currently mock-like and SHALL be specified as a real payment integration when reproduced.
- Coupon redemption must define `CouponUsage` creation and atomic `usedCount` increment.
- Stock alert configuration is currently a no-op and SHALL NOT be documented as persisted.
- Background jobs need atomic claim semantics.
- RAG search is not vector search today.

