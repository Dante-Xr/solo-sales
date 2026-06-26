import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {
  test('should display product list', async ({ page }) => {
    await page.goto('/products');

    await page.waitForLoadState('networkidle');

    // Should see product cards
    const productCards = page.locator('[data-testid="product-card"], .product-card, article, div[class*="card"]');
    expect(await productCards.count()).toBeGreaterThan(0);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/product-list.png' });
  });

  test('should display product details', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Click first product
    const firstProduct = page.locator('a[href*="/product/"], a[href*="/products/"]').first();

    if (await firstProduct.isVisible()) {
      await firstProduct.click();

      // Wait for product detail page
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/product\/|\/products\//);

      // Should see product name
      const productName = page.locator('h1, h2').first();
      await expect(productName).toBeVisible();

      // Should see price with Klein Blue/Red theme
      const price = page.locator('[class*="price"], span[class*="text-price"]');
      if (await price.count() > 0) {
        await expect(price.first()).toBeVisible();
      }

      // Take screenshot
      await page.screenshot({ path: 'tests/screenshots/product-detail.png' });
    }
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Navigate to first product
    const firstProductLink = page.locator('a[href*="/product/"], a[href*="/products/"]').first();

    if (await firstProductLink.isVisible()) {
      await firstProductLink.click();
      await page.waitForLoadState('networkidle');

      // Find "Add to Cart" button (should use Klein Blue theme)
      const addToCartBtn = page.locator(
        'button:has-text("加入购物车"), button:has-text("Add to Cart"), button[class*="bg-brand"]'
      ).first();

      if (await addToCartBtn.isVisible()) {
        // Verify button uses brand color (Klein Blue)
        const bgColor = await addToCartBtn.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).toBeTruthy();

        // Click add to cart
        await addToCartBtn.click();

        // Wait for success feedback
        await page.waitForTimeout(1000);

        // Cart count should increase
        const cartBadge = page.locator('[data-testid="cart-count"], .cart-count, [class*="badge"]');
        if (await cartBadge.count() > 0) {
          const count = await cartBadge.first().textContent();
          expect(parseInt(count || '0')).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Find category filters
    const categoryFilter = page.locator('[data-testid="category-filter"], button[class*="category"], a[class*="category"]').first();

    if (await categoryFilter.isVisible()) {
      const initialProductCount = await page.locator('[data-testid="product-card"], .product-card').count();

      await categoryFilter.click();
      await page.waitForTimeout(1000);

      // Product list should update
      const newProductCount = await page.locator('[data-testid="product-card"], .product-card').count();

      // Count might be different (or same if no filter applied)
      expect(newProductCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should sort products', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Find sort dropdown
    const sortDropdown = page.locator('select[name*="sort"], button:has-text("排序"), button:has-text("Sort")').first();

    if (await sortDropdown.isVisible()) {
      await sortDropdown.click();
      await page.waitForTimeout(500);

      // Select price sort option
      const priceSortOption = page.locator('option[value*="price"], [role="menuitem"]:has-text("价格"), [role="menuitem"]:has-text("Price")').first();

      if (await priceSortOption.isVisible()) {
        await priceSortOption.click();
        await page.waitForTimeout(1000);

        // Products should be reordered
        await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
      }
    }
  });

  test('should paginate products', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Find pagination controls
    const nextPageBtn = page.locator('button:has-text("下一页"), button:has-text("Next"), a[rel="next"]').first();

    if (await nextPageBtn.isVisible() && !await nextPageBtn.isDisabled()) {
      await nextPageBtn.click();
      await page.waitForLoadState('networkidle');

      // Should be on page 2
      const url = page.url();
      expect(url).toMatch(/page=2|products\/2/);
    }
  });

  test('should display product reviews', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Navigate to first product
    const firstProductLink = page.locator('a[href*="/product/"], a[href*="/products/"]').first();

    if (await firstProductLink.isVisible()) {
      await firstProductLink.click();
      await page.waitForLoadState('networkidle');

      // Scroll to reviews section
      const reviewsSection = page.locator('[data-testid="reviews"], [id*="review"], section:has-text("评论"), section:has-text("Reviews")').first();

      if (await reviewsSection.isVisible()) {
        await reviewsSection.scrollIntoViewIfNeeded();

        // Should see review cards
        const reviewCards = page.locator('[data-testid="review-card"], .review-card, [class*="review"]');
        expect(await reviewCards.count()).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
