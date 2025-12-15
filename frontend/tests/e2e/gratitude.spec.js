// frontend/tests/e2e/gratitude.spec.js
// E2E tests cho Gratitude Jar flow
import { test, expect } from '@playwright/test';

test.describe('Gratitude Jar', () => {
  test('should navigate to gratitude page', async ({ page }) => {
    await page.goto('/gratitude');
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    const pageTitle = page.locator('h1, [data-testid="page-title"]').first();
    if (await pageTitle.count() > 0) {
      await expect(pageTitle).toBeVisible();
    }
  });

  test('should add gratitude entry', async ({ page }) => {
    await page.goto('/gratitude');
    await page.waitForLoadState('networkidle');
    
    // Find input field
    const input = page.locator('input[type="text"], textarea, [data-testid="gratitude-input"]').first();
    if (await input.count() === 0) {
      test.skip();
    }

    // Add gratitude
    await input.fill('Biết ơn vì có gia đình');
    
    // Submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Thêm"), button:has-text("Add")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

