<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Storefront Pages Checklist

## Documentation Completeness

- [ ] Home, product listing, product detail, search, cart, orders, and profile are covered.
- [ ] `/zh` and `/en` are covered.

## Functional Correctness

- [ ] Product data comes from the server.
- [ ] Cart checkout submits only product IDs and quantities.
- [ ] Pages have loading, empty, error, and success states.

## Data And API Contract

- [ ] Product APIs use the Unified API Contract.
- [ ] Product price and inventory come from the database.

## Security And Permissions

- [ ] Unpublished products are not exposed.
- [ ] Order pages show only the current user's data.

## Reliability And Failure Modes

- [ ] Storefront pages do not 500 when the database is unavailable.
- [ ] Empty product states are recoverable.

## Verification Commands

- [ ] `npm test -- src/app/[locale]/products/page.test.tsx`
- [ ] `npm run smoke:synthetic`

