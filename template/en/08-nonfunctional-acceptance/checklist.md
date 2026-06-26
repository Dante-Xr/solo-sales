<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Nonfunctional Requirements And Acceptance Baseline Checklist

## Documentation Completeness

- [ ] Security, performance, reliability, cache, external dependencies, logging, and monitoring are covered.
- [ ] v1.5 does not claim 100k QPS production capacity.

## Functional Correctness

- [ ] Smoke/synthetic covers key pages and APIs.
- [ ] Perf baseline reports QPS, P95/P99, error rate, and 503 ratio.

## Data And API Contract

- [ ] Dependency failures map to standard errors.

## Security And Permissions

- [ ] Production secrets, admin password, and payment webhook secret have check items.

## Reliability And Failure Modes

- [ ] Database, Redis, payments, and support have failure strategies.
- [ ] Cache failure does not collapse the main business path.

## Verification Commands

- [ ] `npm run lint`
- [ ] `node .\node_modules\typescript\bin\tsc --noEmit`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run smoke:synthetic`
- [ ] `npm run perf:baseline`
