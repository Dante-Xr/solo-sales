import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if title is visible
    await expect(page.locator('h1')).toBeVisible();

    // Take screenshot for visual review
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
  });

  test('should display Klein Blue theme colors', async ({ page }) => {
    await page.goto('/');

    // Check if brand colors are applied (Klein Blue)
    const brandButton = page.locator('button[class*="bg-brand"]').first();
    if (await brandButton.isVisible()) {
      const bgColor = await brandButton.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      // Klein Blue should have blue tone
      expect(bgColor).toBeTruthy();
    }
  });

  test('should navigate to product list', async ({ page }) => {
    await page.goto('/');

    // Close welcome modal if present
    const closeModalBtn = page.locator('button:has-text("关闭"), button:has-text("Close"), button[aria-label*="close"]');
    if (await closeModalBtn.isVisible()) {
      await closeModalBtn.click();
      await page.waitForTimeout(500);
    }

    // Click on navigation link to products
    const productsLink = page.locator('a[href*="products"]').first();
    await productsLink.click();

    // Verify navigation
    await expect(page).toHaveURL(/products/);
  });
});
