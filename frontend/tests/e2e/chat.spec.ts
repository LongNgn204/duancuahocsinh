import { test, expect } from '@playwright/test';

const gotoChat = async (page: any) => {
  await page.goto('/chat');
  await expect(page.getByRole('main', { name: 'Khu vực trò chuyện' })).toBeVisible();
};

test.describe('Chat E2E', () => {
  test('should append assistant message when sending hello (stream or echo)', async ({ page }) => {
    await gotoChat(page);

    const input = page.getByRole('textbox', { name: 'Ô nhập tin nhắn' });
    await input.fill('hello');
    await page.getByRole('button', { name: 'Gửi', exact: true }).click();

    // Wait for assistant bubble to appear (2nd item)
    const secondBubble = page.getByRole('listitem').nth(1);
    await expect(secondBubble).toBeVisible({ timeout: 15000 });
    const lastText = await secondBubble.innerText();
    expect((lastText || '').trim().length).toBeGreaterThan(0);
  });

  test('should show SOS overlay when dangerous phrase is sent', async ({ page }) => {
    await gotoChat(page);

    const input = page.getByRole('textbox', { name: 'Ô nhập tin nhắn' });
    await input.fill('tôi muốn tự tử');
    await page.getByRole('button', { name: 'Gửi', exact: true }).click();

    const dialog = page.getByRole('dialog', { name: 'Cảnh báo SOS' });
    await expect(dialog).toBeVisible({ timeout: 8000 });
    await expect(dialog.getByText('Tín hiệu SOS')).toBeVisible();
  });
});
