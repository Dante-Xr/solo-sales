<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Documentation System Checklist

## Documentation Completeness

- [ ] Explain the relationship among `template`, `README.md`, `.trae/specs`, and `CHANGELOG.md`.
- [ ] Every topic directory has `spec.md`, `tasks.md`, and `checklist.md`.
- [ ] Chinese and English topic counts match.

## Functional Correctness

- [ ] Templates are not described as implemented features.
- [ ] AI agents are required to inspect repository facts first.

## Data And API Contract

- [ ] The Unified API Contract and data model constraints are preserved.

## Security And Permissions

- [ ] Sensitive work requires auth, CSRF, and RBAC review.

## Reliability And Failure Modes

- [ ] Dependency failures, empty states, and error states are covered.

## Verification Commands

- [ ] `Get-ChildItem template\en -Recurse -Filter *.md | Measure-Object`
- [ ] `rg -n "Updated At|Change Summary|Model" template\en`

