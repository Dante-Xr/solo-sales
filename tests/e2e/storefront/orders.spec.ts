/**
 * ============================================
 * E2E测试 - 订单历史
 * ============================================
 * 创建时间：2026-06-27 16:30:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：查看订单、订单详情
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Order History', () => {
  test('should view order history', async ({ page }) => {
    await page.goto('/account/orders')

    await expect(page.locator('[data-testid="order-item"]')).toBeVisible()
  })

  test('should view order details', async ({ page }) => {
    await page.goto('/account/orders')

    await page.click('[data-testid="order-item"]:first-child')

    await expect(page.locator('[data-testid="order-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible()
  })

  test('should track order', async ({ page }) => {
    await page.goto('/account/orders/1')

    await page.click('button:has-text("物流追踪"), button:has-text("Track Order")')

    await expect(page.locator('[data-testid="tracking-info"]')).toBeVisible()
  })
})
