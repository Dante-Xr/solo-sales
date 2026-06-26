<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Database Models And State Machines Checklist

## Documentation Completeness

- [ ] All core data domains are covered.
- [ ] Models, fields, relationships, and enums are listed.
- [ ] Indexes and unique constraints are listed.

## Functional Correctness

- [ ] Monetary fields use Decimal.
- [ ] Order and payment state machines are clear.
- [ ] Background job retry and dead-letter behavior is clear.

## Data And API Contract

- [ ] APIs do not expose unauthorized data.
- [ ] Cache is not the source of truth.

## Security And Permissions

- [ ] RBAC includes AdminUser, Role, Permission, and PermissionLog.

## Reliability And Failure Modes

- [ ] Concurrent stock decrement uses conditional updates.
- [ ] Payment webhook has idempotency constraints.

## Verification Commands

- [ ] `npx prisma validate`
- [ ] `npx prisma generate`

