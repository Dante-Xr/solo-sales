<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Project Architecture Checklist

## Documentation Completeness

- [ ] Next.js 16 App Router is stated.
- [ ] Modular Monolith is stated.
- [ ] `src/server` layering is stated.

## Functional Correctness

- [ ] Route Handlers only perform HTTP entry responsibilities.
- [ ] Business rules live in services.
- [ ] Prisma queries live in repositories or service transactions.

## Data And API Contract

- [ ] New APIs follow the Unified API Contract.
- [ ] Errors use `AppError` and shared error codes.

## Security And Permissions

- [ ] Sensitive paths describe auth, CSRF, or RBAC.

## Reliability And Failure Modes

- [ ] External dependencies define timeout, retry, and error mapping.

## Verification Commands

- [ ] `npm run lint`
- [ ] `node .\node_modules\typescript\bin\tsc --noEmit`

