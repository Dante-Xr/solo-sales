# Template Directory

## Purpose

This directory contains **reusable requirements templates** for AI-reproducible development of SoloSales features. It serves as a specification library for product, architecture, engineering, QA, and AI agents.

## Structure

```
template/
├── en/          # English templates
│   ├── 00-documentation-system/
│   ├── 01-project-architecture/
│   ├── 02-storefront-pages/
│   ├── 03-database-models/
│   ├── 04-payment-integration/
│   ├── 05-admin-backend/
│   ├── 06-marketing-features/
│   └── 07-admin-operations/
└── zh/          # Chinese templates
    └── (same structure)
```

## Usage

### For New Feature Development

1. **Copy relevant templates** from this directory
2. **Adapt to feature context** under `.trae/specs/{feature-name}/`
3. **Fill in concrete requirements**, tasks, and checklists
4. **Execute and verify** according to the adapted specification

### Template Files

Each module contains:
- `spec.md` - Feature requirements and acceptance criteria
- `tasks.md` - Breakdown of implementation tasks
- `checklist.md` - Verification checklist for completion

## Scope Boundary

**This directory is NOT:**
- A replacement for `README.md` (project overview)
- A replacement for `CHANGELOG.md` (version history)
- A replacement for `RELEASES.md` (release notes)
- A replacement for `.trae/specs` (active feature specs)

**This directory IS:**
- A library of reusable requirement patterns
- A reference for AI agents to understand SoloSales architecture
- A template system for consistent feature documentation

## Version

Templates reflect **SoloSales v1.5.0** architecture:
- Modular Monolith (no microservices)
- Next.js 16 App Router
- `src/server` service layer
- Unified API contracts
- Prisma + PostgreSQL

## For AI Agents

When reproducing SoloSales or implementing features:
1. Read existing code in the repository FIRST
2. Use these templates as structural guides
3. Preserve architectural patterns (service layer, API contracts, RBAC)
4. Follow verification commands (lint, tsc, jest, build)

---

**Note:** This directory is intentionally kept outside `.gitignore` to serve as living documentation for the project's architectural patterns.
