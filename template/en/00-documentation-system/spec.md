<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Documentation System Spec

## Purpose

This directory defines the AI-reproducible requirements system for SoloSales v1.5.0. It is intended for product, architecture, engineering, QA, and AI agents.

## Requirement: Documentation Boundary

The system SHALL treat `template` as a reusable requirements template library, not as a replacement for `README.md`, `.trae/specs`, `CHANGELOG.md`, or `RELEASES.md`.

### Scenario: Creating A Feature Spec

- WHEN a new feature needs implementation
- THEN the implementer SHALL copy the relevant `spec.md`, `tasks.md`, and `checklist.md`
- AND adapt them under `.trae/specs/{feature}` with concrete feature context

## Requirement: AI Execution Rules

AI agents SHALL inspect the current repository before making implementation decisions. For Next.js 16 pages, Route Handlers, configuration, or proxy behavior, agents SHALL read the relevant local documentation under `node_modules/next/dist/docs/`.

### Scenario: Reproducing SoloSales

- WHEN AI reproduces SoloSales from these documents
- THEN it SHALL preserve the Modular Monolith, Unified API Contract, `src/server` layering, Prisma data model, and verification commands
- AND it SHALL NOT describe incomplete capabilities as finished

## Relationship

- `README.md`: current project capability overview
- `.trae/specs`: executable feature-level specifications
- `template`: reusable requirement skeletons
- `CHANGELOG.md` / `RELEASES.md`: released change history

