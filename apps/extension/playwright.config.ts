import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  globalSetup: './tests/global-playwright-setup.js',
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [process.env.CI ? 'github' : 'list'],
    [process.env.CI ? 'blob' : 'html', { open: 'never' }],
  ],
  use: {
    trace: process.env.BRANCH_NAME === 'dev' ? 'on' : 'on-first-retry',
  },
  projects: [
    {
      name: 'revamp-enabled',
      testDir: './tests/specs',
      use: {
        ...devices['Desktop Chrome'],
        extensionRevamp: true,
      },
    },
    {
      name: 'revamp-disabled',
      testDir: './tests/specs',
      use: {
        ...devices['Desktop Chrome'],
        extensionRevamp: false,
      },
    },
    {
      name: 'revamp-only',
      testDir: './tests/specs-revamp',
      use: {
        ...devices['Desktop Chrome'],
        extensionRevamp: true,
      },
    },
    {
      name: 'chromium',
      testDir: './tests/specs',
      use: {
        ...devices['Desktop Chrome'],
        extensionRevamp: true,
      },
    },
  ],
  webServer: {
    command: 'pnpm dev:test-app',
    port: 3000,
    timeout: 15000,
  },
});
