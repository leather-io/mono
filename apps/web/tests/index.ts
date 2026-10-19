import { type NetworkFixture, createNetworkFixture } from '@msw/playwright';
import { type Page, type Response, test as base, expect } from '@playwright/test';

import { truncateMiddle } from '@leather.io/utils';

import { successHandlers } from '../app/mocks/api/mock-handlers';

type Mode = 'mock-installed' | 'mock-connected' | 'uninstalled';
interface ModeOptions {
  mode: Mode;
}

type StorageEntries = [string, string][];

interface Fixtures {
  network: NetworkFixture;
  mode(options?: ModeOptions): Promise<void>;
}

interface WorkerFixtures {
  connectedStorage: StorageEntries;
}

const mockModeStorage: StorageEntries = [['leather-mock-mode', 'true']];
const mockStxAddress = 'SP32YZPY7SEF52D2R4AD103SCDP4E7ATVBF1CTEST';
const truncatedAddressChars = 4;

const walletHeaderButtonNames: Record<Mode, string> = {
  uninstalled: 'Install',
  'mock-installed': 'Connect',
  'mock-connected': truncateMiddle(mockStxAddress, truncatedAddressChars),
};

function isConnectQuestResponse(response: Response) {
  return response.url().includes('/v1/quests/connect-earn/complete');
}

function seedLocalStorage(entries: StorageEntries) {
  for (const [key, value] of entries) localStorage.setItem(key, value);
}

function readLocalStorage(): StorageEntries {
  const entries: StorageEntries = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key === null) continue;
    const value = localStorage.getItem(key);
    if (value !== null) entries.push([key, value]);
  }
  return entries;
}

function walletHeaderButton(page: Page, mode: Mode) {
  return page.getByRole('button', { name: walletHeaderButtonNames[mode] });
}

export const test = base.extend<Fixtures, WorkerFixtures>({
  connectedStorage: [
    async ({ browser }, use, workerInfo) => {
      const page = await browser.newPage({ baseURL: workerInfo.project.use.baseURL });
      await page.addInitScript(seedLocalStorage, mockModeStorage);
      await page.goto('/');
      await walletHeaderButton(page, 'mock-installed').click();
      const questCompleted = page.waitForResponse(isConnectQuestResponse);
      await page.getByRole('button', { name: 'Resolve' }).click();
      await questCompleted;
      await expect(walletHeaderButton(page, 'mock-connected')).toBeVisible();
      const entries = await page.evaluate(readLocalStorage);
      await page.close();
      await use(entries);
    },
    { scope: 'worker' },
  ],

  page: async ({ page }, use) => {
    const messages: string[] = [];
    page.on('console', msg => {
      if (
        msg.type() === 'error' &&
        !msg.text().includes('Maximum update depth exceeded') &&
        !msg.text().includes('Failed to fetch manifest patches')
      )
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
  mode: async ({ page, network, connectedStorage }, use) => {
    // API mocks must always be enabled
    network.use();

    async function setMode(options: ModeOptions = { mode: 'mock-installed' }) {
      if (options.mode === 'uninstalled') {
        // No action needed here, wallet uninstalled is the default state
      }

      if (options.mode === 'mock-installed') {
        await page.addInitScript(seedLocalStorage, mockModeStorage);
      }

      if (options.mode === 'mock-connected') {
        await page.addInitScript(seedLocalStorage, connectedStorage);
      }

      await page.goto('/');
      await expect(walletHeaderButton(page, options.mode)).toBeVisible();
    }
    await use(setMode);
  },
});
