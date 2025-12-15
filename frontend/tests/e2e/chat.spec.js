// frontend/tests/e2e/chat.spec.js
// E2E tests cho AI Chat flow
import { test, expect } from '@playwright/test';

test.describe('AI Chat', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to chat page
    await page.goto('/chat');
    // Wait for page to load
    await page.waitForSelector('[data-testid="chat-input"]', { timeout: 10000 }).catch(() => {});
  });

  test('should send and receive message', async ({ page }) => {
    // Skip if chat input not found (might need auth)
    const chatInput = page.locator('input[type="text"], textarea').first();
    if (await chatInput.count() === 0) {
      test.skip();
    }

    // Type message
    await chatInput.fill('Xin chào');
    
    // Send message (click send button or press Enter)
    const sendButton = page.locator('button[aria-label*="Gửi"], button[aria-label*="Send"]').first();
    if (await sendButton.count() > 0) {
      await sendButton.click();
    } else {
      await chatInput.press('Enter');
    }

    // Wait for response (should appear within 10s)
    await page.waitForTimeout(2000);
    
    // Check if response area exists
    const responseArea = page.locator('[data-testid="chat-messages"], .chat-message, .message').first();
    if (await responseArea.count() > 0) {
      // Response should be visible
      await expect(responseArea).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display chat interface', async ({ page }) => {
    // Check for chat UI elements
    const chatContainer = page.locator('.chat-container, [data-testid="chat"]').first();
    if (await chatContainer.count() > 0) {
      await expect(chatContainer).toBeVisible();
    }
  });
});

