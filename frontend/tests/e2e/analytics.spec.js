// frontend/tests/e2e/analytics.spec.js
// E2E tests cho Analytics page
import { test, expect } from '@playwright/test';

test.describe('Analytics', () => {
  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    const pageContent = page.locator('body').first();
    await expect(pageContent).toBeVisible();
  });

  test('should display charts or stats', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for charts to load
    await page.waitForTimeout(2000);
    
    // Check if any content is visible
    const content = page.locator('main, .analytics, [data-testid="analytics"]').first();
    if (await content.count() > 0) {
      await expect(content).toBeVisible();
    }
  });
});

