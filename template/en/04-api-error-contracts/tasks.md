<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# API And Error Contracts Tasks

## Phase 1: Discovery And Boundaries

- Read `src/server/contracts/api.ts` and `errors.ts`.
- Read `src/app/api/**/route.ts`.
- Mark historical top-level compatibility fields.

## Phase 2: Implementation Requirements

- Define method, path, auth, request parameters, and response body for every API.
- Define error code, HTTP status, and business meaning.
- Define CSRF, rate limit, idempotency, and cache rules.
- Define when old compatibility fields remain.

## Phase 3: Tests And Verification

- Test success, validation failure, unauthenticated, forbidden, conflict, and dependency unavailable paths.
- Ensure `details` are exposed only in development.

## Phase 4: Documentation And Handoff

- Document API contracts in tables.
- Add an error matrix to checklists.

