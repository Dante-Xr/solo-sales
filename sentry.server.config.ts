/**
 * ============================================
 * Sentry Server 配置 (v0.5.8)
 * ============================================
 */

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NODE_ENV,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  beforeBreadcrumb(breadcrumb) {
    return breadcrumb
  },

  beforeSend(event) {
    if (process.env.NODE_ENV === "development") {
      console.log("Sentry server event:", event)
      return null
    }
    return event
  },
})