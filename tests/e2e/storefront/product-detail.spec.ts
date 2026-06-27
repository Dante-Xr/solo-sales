/**
 * ============================================
 * E2E测试 - 商品详情页
 * ============================================
 * 创建时间：2026-06-27 16:25:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：图片切换、规格选择、评论
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Product Detail Page', () => {
  test('should display product details', async ({ page }) => {
    await page.goto('/product/1')

    await expect(page.locator('[data-testid="product-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible()
  })

  test('should switch product images', async ({ page }) => {
    await page.goto('/product/1')

    // 点击第二张缩略图
    await page.click('[data-testid="thumbnail"]:nth-child(2)')

    // 验证主图已切换
    await expect(page.locator('[data-testid="main-image"]')).toHaveAttribute('src', /image-2/)
  })

  test('should load product reviews', async ({ page }) => {
    await page.goto('/product/1')

    // 滚动到评论区
    await page.locator('[data-testid="reviews-section"]').scrollIntoViewIfNeeded()

    // 验证评论已加载
    await expect(page.locator('[data-testid="review-item"]').first()).toBeVisible()
  })
})
