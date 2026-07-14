/**
 * ============================================
 * E2E测试 - 响应式设计
 * ============================================
 * 创建时间：2026-06-27 16:30:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：移动端和桌面端显示
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Responsive Design', () => {
  test('should display mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await page.click('[data-testid="mobile-menu-button"]')

    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible()
  })

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible()
  })
})
