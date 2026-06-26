<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Auth And Admin RBAC Spec

## Purpose

Define customer auth, admin auth, Session, AdminUser, Role, Permission, PermissionLog, and permission-cache requirements.

## Requirement: Customer Auth

The system SHALL use Better Auth for customer registration, login, sessions, and account linkage.

### Scenario: Unauthenticated Access To Protected Data

- WHEN an unauthenticated user accesses profile or order resources
- THEN the system SHALL return 401 or redirect to login
- AND it SHALL NOT return another user's data

## Requirement: Admin RBAC

Admin operations SHALL use the `AdminUser -> Role -> Permission` model. Admin write APIs SHALL check administrator permissions.

### Scenario: Forbidden Admin Write

- WHEN an admin lacks the required permission
- THEN the system SHALL return 403
- AND it SHOULD record enough audit context

## Requirement: Audit And Cache

Permission, role, and admin changes SHALL write `PermissionLog` and invalidate related Redis permission cache entries.

