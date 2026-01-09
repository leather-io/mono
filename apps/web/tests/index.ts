import { type NetworkFixture, createNetworkFixture } from '@msw/playwright';
import { test as base } from '@playwright/test';

import { successHandlers } from '../app/mocks/api/mock-handlers';

type Mode = 'mock-installed' | 'mock-connected' | 'uninstalled';
interface ModeOptions {
  mode: Mode;
}

interface Fixtures {
  network: NetworkFixture;
  mode(options?: ModeOptions): Promise<void>;
}

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    const messages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Maximum update depth exceeded'))
        messages.push(`[${msg.type()}] ${msg.text()}`);
    });
    page.on('pageerror', error => {
      messages.push(`[${error.name}] ${error.message}`);
    });
    await use(page);

    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error clearing page storage', e);
      }
    });

    await page.close();

    if (messages.length > 0) {
      const errorMessage = `Test produced ${messages.length} console error(s):\n${messages.join('\n')}`;
      // eslint-disable-next-line no-console
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
  network: createNetworkFixture({
    initialHandlers: [...successHandlers],
  }) as any,

  // Used to configure varying extension states
  mode: async ({ page, network }, use) => {
    // API mocks must always be enabled
    network.use();

    async function setMode(options: ModeOptions = { mode: 'mock-installed' }) {
      await page.goto('http://localhost:5173');
      await page.waitForLoadState('networkidle');

      if (options.mode === 'uninstalled') {
        // No action needed here, wallet uninstalled is the default state
      }

      if (options.mode === 'mock-installed') {
        await page.evaluate(() => localStorage.setItem('leather-mock-mode', 'true'));
        await page.reload();
      }

      if (options.mode === 'mock-connected') {
        await page.evaluate(() => localStorage.setItem('leather-mock-mode', 'true'));
        await page.reload();
        await page.getByRole('button', { name: 'Connect' }).click();
        await page.getByRole('button', { name: 'Resolve' }).click();
      }
    }
    await use(setMode);
  },
});
