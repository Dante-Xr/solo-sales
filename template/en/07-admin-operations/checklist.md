<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Admin Operations Checklist

## Documentation Completeness

- [ ] Dashboard, products, orders, customers, imports, knowledge, chat, RBAC, and settings are covered.

## Functional Correctness

- [ ] Lists support filtering, pagination, and sorting.
- [ ] Write operations provide success and failure feedback.
- [ ] Batch operations have confirmation and rollback semantics.

## Data And API Contract

- [ ] Admin APIs use the Unified API Contract.
- [ ] Refine data provider can unwrap standard responses.

## Security And Permissions

- [ ] Admin pages and APIs define permission requirements.
- [ ] Write operations create audit logs.

## Reliability And Failure Modes

- [ ] Dashboard supports dependency failure degradation.
- [ ] Import failures are recorded in ImportLog.

## Verification Commands

- [ ] `npm test -- src/app/api/admin/dashboard/__tests__/route.test.ts`
- [ ] `npm run smoke:synthetic`

