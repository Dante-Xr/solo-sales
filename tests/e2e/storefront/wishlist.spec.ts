/**
 * ============================================
 * E2E测试 - 愿望清单
 * ============================================
 * 创建时间：2026-06-27 16:30:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：添加/删除愿望清单
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Wishlist', () => {
  test('should add product to wishlist', async ({ page }) => {
    await page.goto('/product/1')

    await page.click('[data-testid="add-to-wishlist"]')

    await expect(page.locator('text=已添加到愿望清单, text=Added to wishlist')).toBeVisible()
  })

  test('should view wishlist', async ({ page }) => {
    await page.goto('/wishlist')

    await expect(page.locator('[data-testid="wishlist-item"]')).toBeVisible()
  })

  test('should remove from wishlist', async ({ page }) => {
    await page.goto('/wishlist')

    await page.click('[data-testid="remove-wishlist"]:first-child')

    await expect(page.locator('text=已移除, text=Removed')).toBeVisible()
  })
})
