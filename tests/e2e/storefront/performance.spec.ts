/**
 * ============================================
 * E2E测试 - 性能和可访问性
 * ============================================
 * 创建时间：2026-06-27 16:30:00 +08:00
 * 创建依据：高级开发者专家建议 - P3优先级
 * 测试覆盖：页面加载性能、可访问性
 * ============================================
 */
import { test, expect } from '@playwright/test'

test.describe('Performance and Accessibility', () => {
  test('should load homepage quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(3000) // 3秒内加载
  })

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')

    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1) // 只有一个h1
  })

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/')

    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy() // 所有图片都有alt文本
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')

    // 按Tab键导航
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)

    expect(focusedElement).toBeTruthy()
  })
})
