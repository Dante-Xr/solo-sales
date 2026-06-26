<!--
Updated At: 2026-06-11 15:47:34 +08:00
Change Summary: Added SoloSales AI-reproducible development requirements document.
Model: gpt-5.5
-->

# API And Error Contracts Spec

## Purpose

Define SoloSales API responses, errors, auth, CSRF, rate limits, idempotency, cache rules, and compatibility fields.

## Requirement: Unified Response

All new APIs SHALL return the Unified API Contract. Success is `{ success: true, data, meta? }`; failure is `{ success: false, error: { code, message, details? } }`.

### Scenario: Successful API Call

- WHEN a request succeeds
- THEN the response SHALL include `success: true`
- AND business data SHALL be placed under `data`

### Scenario: Failed API Call

- WHEN a request fails
- THEN the response SHALL include `success: false`
- AND the error SHALL use shared error codes and HTTP status semantics

## Requirement: Error Semantics

The system SHALL preserve clear semantics for 401, 403, 404, 409, 422, 500, 502, and 503. Dependency unavailability SHALL map to `SERVICE_UNAVAILABLE`.

## Requirement: Write Protection

Write APIs SHOULD use CSRF, auth, rate limits, or RBAC. Orders and payments SHALL include idempotency or replay protection.

