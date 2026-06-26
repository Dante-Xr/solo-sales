<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Auth And Admin RBAC Tasks

## Phase 1: Discovery And Boundaries

- Read `src/lib/auth.ts` and `src/server/auth/session.ts`.
- Read `src/lib/adminAuth.ts`, `admin-service`, and `admin-repository`.
- Read RBAC API routes.

## Phase 2: Implementation Requirements

- Define customer, admin, role, and permission boundaries.
- Define the difference between 401 and 403.
- Define permission cache keys, cache invalidation, and audit logs.
- Require admin write APIs to include CSRF and RBAC constraints.

## Phase 3: Tests And Verification

- Test unauthenticated, forbidden, and allowed paths.
- Test cache invalidation after role and permission changes.
- Test PermissionLog creation.

## Phase 4: Documentation And Handoff

- Add permission names, role responsibilities, and admin page access matrices to concrete feature specs.

