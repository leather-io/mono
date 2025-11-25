import { expect, Locator, Page } from '@playwright/test';
import { makeUnsignedSTXTokenTransfer } from '@stacks/transactions';

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

export async function seedSoftwareWallet(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/index.html`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => Boolean(window.chrome?.storage?.local));

  const walletState = JSON.parse(JSON.stringify(testSoftwareAccountDefaultWalletState));

  await page.evaluate(
    async ({ state, encryptionKey }) => {
      await Promise.all([
        new Promise<void>(resolve => chrome.storage.local.set({ 'persist:root': state }, () => resolve())),
        new Promise<void>(resolve => chrome.storage.session.set({ encryptionKey }, () => resolve())),
      ]);
    },
    { state: walletState, encryptionKey: TEST_ACCOUNT_DERIVED_KEY }
  );

  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByTestId(HomePageSelectors.HomePageContainer)).toBeVisible();
}
