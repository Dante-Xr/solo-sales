<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Database Models And State Machines Tasks

## Phase 1: Discovery And Boundaries

- Read `prisma/schema.prisma`.
- Read `src/server/repositories` and critical services.
- List models, enums, indexes, and unique constraints.

## Phase 2: Implementation Requirements

- Document domain responsibilities and relationships.
- Document unique constraints such as `Payment(provider, transactionId)`, `Product.sku`, `Coupon.code`, and `User.email`.
- Document state machines for Order, Payment, BackgroundJob, and EmailSequenceEnrollment.
- Document consistency and concurrency requirements.

## Phase 3: Tests And Verification

- Run `npx prisma validate`.
- Run `npx prisma generate` for schema changes.
- Add transaction tests for orders, payments, points, and coupons.

## Phase 4: Documentation And Handoff

- Record current gaps and reproduction requirements.
- State that cache is not the source of truth; PostgreSQL and Prisma are.

