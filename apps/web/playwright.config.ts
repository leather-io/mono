import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 3 : undefined,

  reporter: [
    [process.env.CI ? 'github' : 'list'],
    [process.env.CI ? 'blob' : 'html', { open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: process.env.CI ? 'pnpm exec vite preview' : 'pnpm preview',
    url: 'http://localhost:4173',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
