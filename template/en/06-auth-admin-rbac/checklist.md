<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# Auth And Admin RBAC Checklist

## Documentation Completeness

- [ ] Better Auth is covered.
- [ ] AdminUser, Role, Permission, and PermissionLog are covered.

## Functional Correctness

- [ ] Customers can access only their own data.
- [ ] Admin write operations check permissions.

## Data And API Contract

- [ ] 401 means unauthenticated.
- [ ] 403 means authenticated but forbidden.

## Security And Permissions

- [ ] Permission changes write audit logs.
- [ ] Permission changes clear caches.

## Reliability And Failure Modes

- [ ] Redis cache failure does not grant extra permissions.
- [ ] Default admin password must be changed in production.

## Verification Commands

- [ ] `npm test -- src/server/services/__tests__/admin-service.test.ts`
- [ ] `npm run smoke:synthetic`

