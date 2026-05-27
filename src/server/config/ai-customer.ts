/**
 * ?????2026-05-27
 * ????v0.1.0
 * ??????? 10 - SoloSales ??
 * ?????
 * 1. ?? AI CustomerService ????????
 * 2. ???????? Python ?????????token?HMAC ????
 */
import "server-only"

export interface AiCustomerConfig {
  enabled: boolean
  baseUrl: string
  serviceToken: string
  hmacSecret: string
  timeoutMs: number
  tenantId: string
  locale: string
}

export function getAiCustomerConfig(): AiCustomerConfig {
  return {
    enabled: process.env.AI_CUSTOMER_ENABLED === "true",
    baseUrl: process.env.AI_CUSTOMER_BASE_URL || "http://127.0.0.1:8001",
    serviceToken: process.env.AI_CUSTOMER_SERVICE_TOKEN || "",
    hmacSecret: process.env.AI_CUSTOMER_HMAC_SECRET || "",
    timeoutMs: Number(process.env.AI_CUSTOMER_TIMEOUT_MS || 5000),
    tenantId: process.env.AI_CUSTOMER_TENANT_ID || "solo-sales",
    locale: process.env.AI_CUSTOMER_LOCALE || "zh-CN",
  }
}