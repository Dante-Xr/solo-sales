/**
 * ============================================
 * E2E测试 - 优惠券和促销
 * ============================================
 * 创建时间：2026-06-27 16:30:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：应用优惠券
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Coupons and Promotions', () => {
  test('should apply coupon code', async ({ page }) => {
    await page.goto('/cart')

    await page.fill('[data-testid="coupon-input"]', 'SAVE10')
    await page.click('button:has-text("应用"), button:has-text("Apply")')

    await expect(page.locator('text=优惠券已应用, text=Coupon applied')).toBeVisible()
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible()
  })

  test('should show promotion banner', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="promo-banner"]')).toBeVisible()
  })

  test('should validate invalid coupon', async ({ page }) => {
    await page.goto('/cart')

    await page.fill('[data-testid="coupon-input"]', 'INVALID')
    await page.click('button:has-text("应用"), button:has-text("Apply")')

    await expect(page.locator('text=无效, text=Invalid')).toBeVisible()
  })
})
