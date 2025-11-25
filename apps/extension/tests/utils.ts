import { expect, Locator, Page } from '@playwright/test';
import { makeUnsignedSTXTokenTransfer } from '@stacks/transactions';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { HomePageSelectors } from './selectors/home.selectors';
import { SharedComponentsSelectors } from './selectors/shared-component.selectors';
import {
  TEST_ACCOUNT_DERIVED_KEY,
  testSoftwareAccountDefaultWalletState,
} from './fixtures/wallet-state';

export function json(arg: unknown) {
  return {
    body: JSON.stringify(arg),
    contentType: 'application/json',
  };
}

export function createTestSelector<T extends string>(name: T): `[data-testid="${T}"]` {
  return `[data-testid="${name}"]`;
}

export async function getDisplayerAddress(locator: Locator) {
  const displayerAddress = await locator
    .getByTestId(SharedComponentsSelectors.AddressDisplayer)
    .innerText();

  return displayerAddress.replaceAll('\n', '');
}

export async function generateUnsignedStxTransfer(
  recipient: string,
  amount: number,
  network: any,
  publicKey: string,
  memo?: string
) {
  const options = {
    recipient,
    memo,
    publicKey,
    amount,
    network,
  };
  return (await makeUnsignedSTXTokenTransfer(options)).serialize();
}

export async function generateMultisigUnsignedStxTransfer(
  recipient: string,
  amount: number,
  fee: number,
  network: any,
  publicKeys: string[],
  threshold: number,
  nonce: number,
  memo?: string
) {
  const options = {
    fee,
    recipient,
    memo,
    publicKeys,
    nonce,
    numSignatures: threshold,
    amount,
    network,
  };
  return (await makeUnsignedSTXTokenTransfer(options)).serialize();
}

// Intl formatters like NumberFormat output non-breaking spaces. This helper can wrap expected strings to avoid manually writing \u00A0 in tests.
export function withNbsp(value: string) {
  return value.replace(/ /g, '\u00A0');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const walletStorageStatePath = path.resolve(__dirname, './storage-state.json');

interface WalletStorageState {
  localState: Record<string, unknown>;
  sessionState: Record<string, unknown>;
}

async function readWalletStorageStateFromDisk(): Promise<WalletStorageState | null> {
  try {
    const data = await fs.readFile(walletStorageStatePath, 'utf-8');
    return JSON.parse(data) as WalletStorageState;
  } catch (error) {
    return null;
  }
}

async function persistWalletStorageState(page: Page) {
  const state = await page.evaluate(async () => {
    const localState = await chrome.storage.local.get(null);
    const sessionState = await chrome.storage.session.get(null);
    return { localState, sessionState };
  });

  await fs.writeFile(walletStorageStatePath, JSON.stringify(state, null, 2));
}

async function applyWalletState(page: Page, state: WalletStorageState) {
  await page.evaluate(
    async ({ localState, sessionState }) => {
      await new Promise<void>(resolve => chrome.storage.local.clear(() => resolve()));
      await new Promise<void>(resolve => chrome.storage.session.clear(() => resolve()));
      await Promise.all([
        new Promise<void>(resolve => chrome.storage.local.set(localState, () => resolve())),
        new Promise<void>(resolve => chrome.storage.session.set(sessionState, () => resolve())),
      ]);
    },
    state
  );
}

export async function seedSoftwareWallet(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/index.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => Boolean(window.chrome?.storage?.local));

  const persistedState = await readWalletStorageStateFromDisk();
  if (persistedState) {
    await applyWalletState(page, persistedState);
  } else {
    const walletState = JSON.parse(JSON.stringify(testSoftwareAccountDefaultWalletState));

    await page.evaluate(
      async ({ state, encryptionKey }) => {
        await Promise.all([
          new Promise<void>(resolve =>
            chrome.storage.local.set({ 'persist:root': state }, () => resolve())
          ),
          new Promise<void>(resolve => chrome.storage.session.set({ encryptionKey }, () => resolve())),
        ]);
      },
      { state: walletState, encryptionKey: TEST_ACCOUNT_DERIVED_KEY }
    );
    await persistWalletStorageState(page);
  }

  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByTestId(HomePageSelectors.HomePageContainer)).toBeVisible();
}
