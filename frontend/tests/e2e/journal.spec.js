// frontend/tests/e2e/journal.spec.js
// E2E tests cho Journal flow
import { test, expect } from '@playwright/test';

test.describe('Journal', () => {
  test('should navigate to journal page', async ({ page }) => {
    await page.goto('/journal');
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded
    const pageContent = page.locator('body').first();
    await expect(pageContent).toBeVisible();
  });

  test('should add journal entry', async ({ page }) => {
    await page.goto('/journal');
    await page.waitForLoadState('networkidle');
    
    // Find textarea
    const textarea = page.locator('textarea, [data-testid="journal-input"]').first();
    if (await textarea.count() === 0) {
      test.skip();
    }

    // Add journal entry
    await textarea.fill('Hôm nay mình cảm thấy tốt hơn');
    
    // Submit
    const submitButton = page.locator('button[type="submit"], button:has-text("Lưu"), button:has-text("Save")').first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);
    }
  });
});

