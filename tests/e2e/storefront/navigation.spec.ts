import { test, expect } from '@playwright/test';

test.describe('Navigation and Search', () => {
  test('should display top navigation', async ({ page }) => {
    await page.goto('/');

    // Check main navigation elements
    await expect(page.locator('nav')).toBeVisible();

    // Check language switcher
    const langSwitcher = page.locator('[aria-label*="language"], [data-testid="language-switcher"]');
    if (await langSwitcher.count() > 0) {
      await expect(langSwitcher.first()).toBeVisible();
    }

    // Check theme toggle
    const themeToggle = page.locator('[aria-label*="theme"], [data-testid="theme-toggle"]');
    if (await themeToggle.count() > 0) {
      await expect(themeToggle.first()).toBeVisible();
    }
  });

  test('should switch language', async ({ page }) => {
    await page.goto('/');

    // Find and click language switcher
    const langSwitcher = page.locator('[aria-label*="language"], [data-testid="language-switcher"]').first();

    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();

      // Wait for language menu
      await page.waitForTimeout(500);

      // Should see language options
      const langOptions = page.locator('[role="menuitem"], a[href*="/zh"], a[href*="/en"]');
      expect(await langOptions.count()).toBeGreaterThan(0);
    }
  });

  test('should toggle theme', async ({ page }) => {
    await page.goto('/');

    // Get initial theme
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('class');

    // Find and click theme toggle
    const themeToggle = page.locator('[aria-label*="theme"], [data-testid="theme-toggle"], button[class*="theme"]').first();

    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(300);

      // Theme should have changed
      const newTheme = await html.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should perform search', async ({ page }) => {
    await page.goto('/');

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="搜索"]').first();

    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('test product');

      // Press Enter or click search button
      await searchInput.press('Enter');

      // Wait for navigation or results
      await page.waitForTimeout(1000);

      // Should see search results or be on search page
      const url = page.url();
      expect(url).toMatch(/search|products/i);
    }
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');

    // Find products link
    const productsLink = page.locator('a[href*="/products"], a:has-text("产品"), a:has-text("Products")').first();

    if (await productsLink.isVisible()) {
      await productsLink.click();

      // Should be on products page
      await expect(page).toHaveURL(/products/);

      // Should see product list
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
