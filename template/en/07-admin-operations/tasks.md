<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Admin Operations Tasks

## Phase 1: Discovery And Boundaries

- Read pages under `src/app/[locale]/admin`.
- Read `/api/admin/*`, product, order, import, knowledge, and chat APIs.
- Read `src/lib/refine-data-provider.ts`.

## Phase 2: Implementation Requirements

- Define admin modules and permission matrices.
- Define table filtering, pagination, sorting, and batch actions.
- Define cache invalidation, audit logs, and error feedback.
- Define import jobs and knowledge-base version history.

## Phase 3: Tests And Verification

- Test admin API permissions.
- Test dashboard dependency failures.
- Test product-write cache invalidation.

## Phase 4: Documentation And Handoff

- Output page states and API dependencies for every admin module.
- Mark admin write paths that still need stronger permission coverage.

