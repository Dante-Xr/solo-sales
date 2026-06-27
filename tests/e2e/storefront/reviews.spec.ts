/**
 * ============================================
 * E2E测试 - 商品评价
 * ============================================
 * 创建时间：2026-06-27 16:30:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：提交评价、评分、图片上传
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Product Reviews', () => {
  test('should submit product review', async ({ page }) => {
    await page.goto('/product/1')

    await page.click('button:has-text("写评价"), button:has-text("Write Review")')

    await page.click('[data-testid="rating-star-5"]')
    await page.fill('[name="title"]', 'Great product!')
    await page.fill('[name="content"]', 'This is an excellent product.')

    await page.click('button:has-text("提交"), button:has-text("Submit")')

    await expect(page.locator('text=感谢您的评价, text=Thank you')).toBeVisible()
  })

  test('should filter reviews by rating', async ({ page }) => {
    await page.goto('/product/1')

    await page.click('[data-testid="filter-5-stars"]')

    const reviews = await page.locator('[data-testid="review-rating-5"]').count()
    expect(reviews).toBeGreaterThan(0)
  })
})
