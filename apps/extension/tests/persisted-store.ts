import type { Page } from '@playwright/test';
import { isPlainObject } from 'remeda';

interface PersistedStoreSnapshot {
  wallets?: { ids?: string[] };
  accounts?: {
    ids?: string[];
    entities?: Record<string, { name?: string; status?: string } | undefined>;
  };
  active?: {
    account?: { fingerprint: string; accountIndex: number } | null;
    activePolicyId?: string | null;
  };
  chains?: { stx?: Record<string, { highestAccountIndex?: number } | undefined> };
  policy?: { ids?: string[] };
}

function isPersistedStoreSnapshot(value: unknown): value is PersistedStoreSnapshot {
  return isPlainObject(value);
}

export async function readPersistedStore(page: Page) {
  const store = await page.evaluate(() => window.debug.getPersistedStore());
  return isPersistedStoreSnapshot(store) ? store : undefined;
}
