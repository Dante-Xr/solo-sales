# 🧹 Console Statement Cleanup (Tech Debt)

## Description

The codebase contains 114 console statements that should be cleaned up before production deployment. These should either be removed or replaced with structured logging.

## Current State

- Total console statements: **114**
- Located in: `src/` directory
- Types: `console.log`, `console.warn`, `console.error`, `console.info`, `console.debug`

## Scope

### 1. Remove Debug Console (Priority: High)
- Demo/test console statements
- Temporary debugging logs
- Search query logs in headers

### 2. Replace with Structured Logger (Priority: Medium)
- Service layer logs (EmailService, StockAlertService, etc.)
- Redis connection logs
- PWA registration logs
- Wholesaler import logs

### 3. Keep Critical Error Logs (Priority: Low)
- Error boundary console.error
- API error handlers
- Critical failure paths

## Recommended Approach

1. **Install structured logger**: Consider `pino`, `winston`, or integrate with Sentry
2. **Create logger utility**: `src/lib/logger.ts` with development/production modes
3. **Replace incrementally**: Clean up by module (components → services → lib)
4. **Add lint rule**: `no-console` ESLint rule with exceptions for `console.error`

## Acceptance Criteria

- [ ] Reduce console statements to < 20 (critical error logs only)
- [ ] Add structured logger utility
- [ ] Update all service layer logs to use logger
- [ ] Add ESLint rule to prevent new console statements
- [ ] Document logging patterns in CONTRIBUTING.md

## Related

- v1.7 Pre-work: Part of Tier 2 cleanup
- Technical Debt: Code quality improvement
- Production Readiness: Essential before deployment

## Estimated Effort

**2-3 hours** for complete cleanup
