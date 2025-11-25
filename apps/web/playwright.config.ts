import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  // MSW, used via @msw/playwright is not fully isolated to an individual test,
  // so this settings must be disabled
  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [[process.env.CI ? 'github' : 'list'], [process.env.CI ? 'blob' : 'html', { open: 'never' }]],

  use: {
    baseURL: 'http://127.0.0.1:5173/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:5173/',
    reuseExistingServer: !process.env.CI,
  },
});
