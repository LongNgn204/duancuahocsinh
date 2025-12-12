import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run build && npm run preview -- --port=4173',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
      cwd: '.',
      timeout: 120_000,
      env: {
        VITE_API_URL: 'https://ban-dong-hanh-worker.stu725114073.workers.dev'
      }
    },
  ],
});
