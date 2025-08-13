import { type NetworkFixture, createNetworkFixture } from '@msw/playwright';
import { test as base, expect } from '@playwright/test';

import { successHandlers } from '../app/mocks/api/mock-handlers';

type Mode = 'mock-installed' | 'mock-connected' | 'uninstalled';
interface ModeOptions {
  mode: Mode;
}

interface Fixtures {
  network: NetworkFixture;
  mode: (options?: ModeOptions) => Promise<void>;
}

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    const messages: string[] = [];
    page.on('console', msg => {
      // Ignore regular log messages; we are only interested in errors.
      if (msg.type() === 'error' && !msg.text().includes('Maximum update depth exceeded'))
        messages.push(`[${msg.type()}] ${msg.text()}`);
    });
    // Uncaught (in promise) TypeError + friends are page errors.
    page.on('pageerror', error => {
      messages.push(`[${error.name}] ${error.message}`);
    });
    await use(page);
    if (messages.length) {
      // eslint-disable-next-line no-console
      console.log(`Console errors: ${messages.join('\n')}`);
    }
    expect(messages).toStrictEqual([]);
  },
  network: createNetworkFixture({
    initialHandlers: [...successHandlers],
  }) as any,

  // Used to configure varying extension states
  mode: async ({ page, network }, use) => {
    // API mocks must always be enabled
    network.use();

    async function setMode(options: ModeOptions = { mode: 'mock-installed' }) {
      await page.goto('/');

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

      if (options.mode === 'uninstalled') {
        await page.evaluate(() => ((window as any).LeatherProvider = undefined));
      }
    }
    await use(setMode);
  },
});
