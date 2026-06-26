<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Project Architecture Spec

## Purpose

Define the SoloSales architecture baseline: a Modular Monolith built on Next.js 16 App Router.

## Requirement: Architecture Shape

The system SHALL use a Modular Monolith. Storefront, admin, API routes, services, repositories, payments, cache, database, and background jobs SHALL be delivered in one repository.

### Scenario: Adding A Feature

- WHEN a new business feature is added
- THEN the implementation SHALL follow `page -> API route -> service -> repository -> Prisma/PostgreSQL`
- AND it SHALL NOT default to microservices, a separate BFF, or a separate backend project

## Requirement: Module Boundaries

The system SHALL keep `src/app` for pages and Route Handlers, `src/server` for server business logic, `src/lib` for shared tools and adapters, `prisma` for the data model, and `scripts` for verification tools.

### Scenario: Writing Business Logic

- WHEN logic involves orders, payments, inventory, permissions, cache, or dependency failure
- THEN it SHALL live in `src/server/services`
- AND Prisma access SHOULD go through `src/server/repositories`

## Requirement: API Contract

All new APIs SHALL use the Unified API Contract: success is `{ success: true, data, meta? }`; failure is `{ success: false, error: { code, message, details? } }`.

