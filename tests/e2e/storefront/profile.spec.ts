/**
 * ============================================
 * E2E测试 - 用户资料
 * ============================================
 * 创建时间：2026-06-27 16:30:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：查看/编辑资料
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('User Profile', () => {
  test('should view user profile', async ({ page }) => {
    await page.goto('/account/profile')

    await expect(page.locator('[data-testid="user-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible()
  })

  test('should edit profile', async ({ page }) => {
    await page.goto('/account/profile')

    await page.click('button:has-text("编辑"), button:has-text("Edit")')
    await page.fill('[name="name"]', 'Updated Name')
    await page.click('button:has-text("保存"), button:has-text("Save")')

    await expect(page.locator('text=保存成功, text=Saved successfully')).toBeVisible()
  })

  test('should change password', async ({ page }) => {
    await page.goto('/account/security')

    await page.fill('[name="currentPassword"]', 'oldpassword')
    await page.fill('[name="newPassword"]', 'newpassword123')
    await page.fill('[name="confirmPassword"]', 'newpassword123')
    await page.click('button:has-text("更新密码"), button:has-text("Update Password")')

    await expect(page.locator('text=密码已更新, text=Password updated')).toBeVisible()
  })
})
