import type { BrowserContext, Page } from '@playwright/test';
import { makeLedgerTestAccountWalletState } from '@tests/page-object-models/onboarding.page';

import { test } from '../../fixtures/fixtures';

async function interceptRequestPopup(context: BrowserContext) {
  return context.waitForEvent('page');
}

async function initiateGetAddresses(page: Page, params?: object) {
  return page.evaluate(
    params =>
      (window as any).LeatherProvider.request('getAddresses', params).catch((e: unknown) => e),
    params
  );
}

async function clickConnectLeatherButton(popup: Page) {
  const button = popup.getByTestId('get-addresses-approve-button');
  await test.expect(button).toBeVisible();
  await button.click();
}

function getAddressSymbols(result: any) {
  return result.result.addresses.map((address: { symbol: string }) => address.symbol);
}

test.describe('Rpc: getAddresses with chains param', () => {
  test.beforeEach(
    async ({ extensionId, globalPage }) => await globalPage.setupAndUseApiCalls(extensionId)
  );

  test.describe('software wallet', () => {
    test.beforeEach(async ({ extensionId, onboardingPage, page }) => {
      await onboardingPage.signInWithTestAccount(extensionId);
      await page.goto('localhost:3000');
    });

    test('chains: [stacks] returns only stacks addresses', async ({ page, context }) => {
      const getAddressesPromise = initiateGetAddresses(page, { chains: ['stacks'] });
      const popup = await interceptRequestPopup(context);
      await clickConnectLeatherButton(popup);

      const result = await getAddressesPromise;
      test.expect(getAddressSymbols(result)).toEqual(['STX']);
    });

    test('chains: [bitcoin] returns only bitcoin addresses', async ({ page, context }) => {
      const getAddressesPromise = initiateGetAddresses(page, { chains: ['bitcoin'] });
      const popup = await interceptRequestPopup(context);
      await clickConnectLeatherButton(popup);

      const result = await getAddressesPromise;
      test.expect(getAddressSymbols(result)).toEqual(['BTC', 'BTC']);
    });

    test('chains: [] is rejected with invalid params', async ({ page }) => {
      const result = await initiateGetAddresses(page, { chains: [] });

      delete result.id;
      test.expect(result.error.code).toEqual(-32602);
    });
  });

  test.describe('ledger wallet with stacks keys only', () => {
    test.beforeEach(async ({ extensionId, onboardingPage, page }) => {
      await onboardingPage.signInWithLedgerAccount(
        extensionId,
        makeLedgerTestAccountWalletState(['stacks'])
      );
      await page.goto('localhost:3000');
    });

    test('chains: [bitcoin] shows a missing account callout and returns no addresses', async ({
      page,
      context,
    }) => {
      const getAddressesPromise = initiateGetAddresses(page, { chains: ['bitcoin'] });

      const popup = await interceptRequestPopup(context);
      await test.expect(popup.getByTestId('get-addresses-missing-account-callout')).toBeVisible();
      await test.expect(popup.getByText('Bitcoin account not found')).toBeVisible();
      await clickConnectLeatherButton(popup);

      const result = await getAddressesPromise;
      test.expect(result.result.addresses).toEqual([]);
    });

    test('default chains shows a warning callout and returns stacks addresses', async ({
      page,
      context,
    }) => {
      const getAddressesPromise = initiateGetAddresses(page);

      const popup = await interceptRequestPopup(context);
      await test.expect(popup.getByTestId('get-addresses-missing-account-callout')).toBeVisible();
      await test.expect(popup.getByText('Connecting with Stacks only')).toBeVisible();
      await clickConnectLeatherButton(popup);

      const result = await getAddressesPromise;
      test.expect(getAddressSymbols(result)).toEqual(['STX']);
    });
  });
});
