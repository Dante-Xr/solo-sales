/**
 * ============================================
 * Sentry 错误监控配置 (v0.5.8)
 * ============================================
 * 功能说明：
 *   - Next.js 应用错误追踪
 *   - API 错误监控
 *   - 前端异常捕获
 * ============================================
 */

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NODE_ENV,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  replaysOnErrorSampleRate: 1.0,

  attachStacktrace: true,

  maxBreadcrumbs: 50,

  denyUrls: [
    /localhost/,
    /\.hot-update\.js/,
  ],

  ignoreErrors: [
    "ResizeObserver loop",
    "Non-Error promise rejection captured",
  ],
})

export default Sentry