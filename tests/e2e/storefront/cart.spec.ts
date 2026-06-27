/**
 * ============================================
 * E2E测试 - 购物车功能
 * ============================================
 * 创建时间：2026-06-27 16:25:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：添加商品、更新数量、删除商品
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Shopping Cart', () => {
  test('should add product to cart', async ({ page }) => {
    await page.goto('/')

    // 点击第一个商品
    await page.click('[data-testid="product-card"]:first-child')

    // 添加到购物车
    await page.click('button:has-text("加入购物车"), button:has-text("Add to Cart")')

    // 验证购物车图标显示数量
    await expect(page.locator('[data-testid="cart-count"]')).toBeVisible()
  })

  test('should update cart quantity', async ({ page }) => {
    await page.goto('/cart')

    // 增加数量
    await page.click('[data-testid="increase-quantity"]:first-child')

    // 验证数量已更新
    await expect(page.locator('[data-testid="item-quantity"]:first-child')).toContainText('2')
  })

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/cart')

    const initialCount = await page.locator('[data-testid="cart-item"]').count()

    // 删除商品
    await page.click('[data-testid="remove-item"]:first-child')

    // 验证商品已删除
    const newCount = await page.locator('[data-testid="cart-item"]').count()
    expect(newCount).toBe(initialCount - 1)
  })
})
