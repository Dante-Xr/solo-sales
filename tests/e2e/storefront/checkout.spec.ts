/**
 * ============================================
 * E2E测试 - 结账流程
 * ============================================
 * 创建时间：2026-06-27 16:25:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：完整的结账流程
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should complete checkout process', async ({ page }) => {
    await page.goto('/cart')

    // 进入结账
    await page.click('button:has-text("结账"), button:has-text("Checkout")')

    // 填写配送信息
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="address"]', '123 Test Street')

    // 提交订单
    await page.click('button:has-text("提交订单"), button:has-text("Place Order")')

    // 验证订单成功页面
    await expect(page).toHaveURL(/\/order\/success/)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/checkout')

    // 尝试提交空表单
    await page.click('button:has-text("提交订单"), button:has-text("Place Order")')

    // 验证错误提示
    await expect(page.locator('text=required, text=必填')).toBeVisible()
  })
})
