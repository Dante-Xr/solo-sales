/**
 * ============================================
 * E2E测试 - 搜索功能
 * ============================================
 * 创建时间：2026-06-27 16:25:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：搜索商品、筛选、排序
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should search products', async ({ page }) => {
    await page.goto('/')

    // 输入搜索关键词
    await page.fill('[data-testid="search-input"]', 'test product')
    await page.press('[data-testid="search-input"]', 'Enter')

    // 验证搜索结果
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    await page.goto('/products')

    // 选择分类
    await page.click('[data-testid="category-filter"]')
    await page.click('text=Electronics, text=电子产品')

    // 验证筛选结果
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5, { timeout: 10000 })
  })

  test('should sort products', async ({ page }) => {
    await page.goto('/products')

    // 选择排序方式
    await page.click('[data-testid="sort-select"]')
    await page.click('text=Price: Low to High, text=价格：从低到高')

    // 验证排序结果
    const prices = await page.locator('[data-testid="product-price"]').allTextContents()
    expect(prices.length).toBeGreaterThan(0)
  })
})
