/**
 * ============================================
 * E2E测试 - 用户认证
 * ============================================
 * 创建时间：2026-06-27 16:25:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：登录、注册、登出
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('User Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button:has-text("登录"), button:has-text("Login")')

    // 验证登录成功
    await expect(page).toHaveURL('/')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should register new user', async ({ page }) => {
    await page.goto('/register')

    await page.fill('[name="name"]', 'New User')
    await page.fill('[name="email"]', `test${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'password123')
    await page.click('button:has-text("注册"), button:has-text("Register")')

    // 验证注册成功
    await expect(page).toHaveURL('/')
  })

  test('should logout', async ({ page }) => {
    await page.goto('/')

    await page.click('[data-testid="user-menu"]')
    await page.click('text=登出, text=Logout')

    // 验证登出成功
    await expect(page.locator('text=登录, text=Login')).toBeVisible()
  })
})
