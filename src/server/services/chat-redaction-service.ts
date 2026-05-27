/**
 * ?????2026-05-27
 * ????v0.1.0
 * ??????? 10 - SoloSales ??
 * ?????
 * 1. ????????? allowlist?
 * 2. ?? api_key?payment_card?access_token ???????
 */
import "server-only"

export type SafeChatContext = Record<string, unknown>

export const CHAT_CONTEXT_ALLOWLIST = new Set([
  "tenant_id",
  "locale",
  "is_logged_in",
  "user_id",
  "user_email",
  "order_id",
  "order_status",
  "shipping_status",
  "tracking_number",
  "product_id",
  "product_name",
  "product_price",
  "stock_status",
])

export function redactChatContext(context: Record<string, unknown>): SafeChatContext {
  return Object.fromEntries(
    Object.entries(context).filter(([key, value]) => CHAT_CONTEXT_ALLOWLIST.has(key) && value !== undefined && value !== null && value !== "")
  )
}