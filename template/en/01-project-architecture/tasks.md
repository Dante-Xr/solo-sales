<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Project Architecture Tasks

## Phase 1: Discovery And Boundaries

- Read `README.md`, `src/server/README.md`, and `package.json`.
- Read local Next.js 16 documentation for App Router and Route Handlers.
- Confirm the current system is not a microservice architecture.

## Phase 2: Implementation Requirements

- Document the responsibilities of `src/app`, `src/server`, `src/lib`, `prisma`, and `scripts`.
- Fix the `route -> service -> repository -> database` data flow.
- Preserve the Unified API Contract and the server-only boundary.

## Phase 3: Tests And Verification

- Run `npm run lint` and `node .\node_modules\typescript\bin\tsc --noEmit` for architecture-impacting changes.
- Run relevant Jest tests for page or API changes.

## Phase 4: Documentation And Handoff

- Add architecture decisions to the related feature spec.
- Document forbidden drift: microservice split, client-trusted amounts, complex business logic inside routes.

