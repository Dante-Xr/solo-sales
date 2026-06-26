<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# API And Error Contracts Checklist

## Documentation Completeness

- [ ] Every API has method, path, auth, request, and response.
- [ ] Compatibility fields are documented.

## Functional Correctness

- [ ] Success responses include `success` and `data`.
- [ ] Error responses include `success` and `error`.

## Data And API Contract

- [ ] 401, 403, 404, 409, 422, 500, 502, and 503 are clear.
- [ ] Dependency failures map to `SERVICE_UNAVAILABLE`.

## Security And Permissions

- [ ] Write APIs document CSRF, auth, and RBAC.
- [ ] Payments and orders document idempotency.

## Reliability And Failure Modes

- [ ] Cache failure does not block the main flow.
- [ ] External dependency timeouts are bounded.

## Verification Commands

- [ ] `npm test`
- [ ] `npm run smoke:synthetic`

