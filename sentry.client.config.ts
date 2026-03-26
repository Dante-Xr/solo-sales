/**
 * ============================================
 * Sentry Client 配置 (v0.5.8)
 * ============================================
 */

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  replaysSessionSampleRate: 0.1,

  replaysOnErrorSampleRate: 1.0,

  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      console.log("Sentry event:", event)
      return null
    }
    return event
  },
})