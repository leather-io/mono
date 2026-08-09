import baseConfig from '../playwright.config';

export default {
  ...baseConfig,
  testDir: '.',
  globalSetup: './global-playwright-setup.js',
  webServer: undefined,
};
