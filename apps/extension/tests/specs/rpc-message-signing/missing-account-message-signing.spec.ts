import type { BrowserContext, Page } from '@playwright/test';
import {
  getConnectedTestAppPermissionsState,
  makeLedgerTestAccountWalletState,
} from '@tests/page-object-models/onboarding.page';

import { test } from '../../fixtures/fixtures';

async function interceptRequestPopup(context: BrowserContext) {
  return context.waitForEvent('page');
}

function initiateBitcoinMessageSigning(page: Page) {
  return page.evaluate(() =>
    (window as any).LeatherProvider.request('signMessage', {
      message: 'test',
      paymentType: 'p2wpkh',
    }).catch((e: unknown) => e)
  );
}

function initiateStacksMessageSigning(page: Page) {
  return page.evaluate(() =>
    (window as any).LeatherProvider.request('stx_signMessage', {
      message: 'test',
      messageType: 'utf8',
    }).catch((e: unknown) => e)
  );
}

test.describe('Message signing with missing account for requested chain', () => {
  test.beforeEach(
    async ({ extensionId, globalPage }) => await globalPage.setupAndUseApiCalls(extensionId)
  );

  test.describe('signMessage with a stacks-only ledger wallet', () => {
    test.beforeEach(async ({ extensionId, onboardingPage, page }) => {
      await onboardingPage.signInWithLedgerAccount(extensionId, {
        ...makeLedgerTestAccountWalletState(['stacks']),
        ...getConnectedTestAppPermissionsState(),
      });
      await page.goto('localhost:3000', { waitUntil: 'networkidle' });
    });

    test('the request is rejected and the popup warns about the missing bitcoin account', async ({
      page,
      context,
    }) => {
      const resultPromise = initiateBitcoinMessageSigning(page);

      const popup = await interceptRequestPopup(context);
      await test.expect(popup.getByTestId('sign-message-missing-account-error')).toBeVisible();
      await test.expect(popup.getByText('Bitcoin account not found')).toBeVisible();

      const result = await resultPromise;
      delete result.id;

      test.expect(result).toEqual({
        jsonrpc: '2.0',
        error: {
          code: 4002,
          message:
            'Leather does not have a Bitcoin account for this wallet. Add your Bitcoin account in Leather, then retry the request.',
        },
      });
    });
  });

  test.describe('stx_signMessage with a bitcoin-only ledger wallet', () => {
    test.beforeEach(async ({ extensionId, onboardingPage, page }) => {
      await onboardingPage.signInWithLedgerAccount(extensionId, {
        ...makeLedgerTestAccountWalletState(['bitcoin']),
        ...getConnectedTestAppPermissionsState(),
      });
      await page.goto('localhost:3000', { waitUntil: 'networkidle' });
    });

    test('the request is rejected and the popup warns about the missing stacks account', async ({
      page,
      context,
    }) => {
      const resultPromise = initiateStacksMessageSigning(page);

      const popup = await interceptRequestPopup(context);
      await test.expect(popup.getByTestId('sign-message-missing-account-error')).toBeVisible();
      await test.expect(popup.getByText('Stacks account not found')).toBeVisible();

      const result = await resultPromise;
      delete result.id;

      test.expect(result).toEqual({
        jsonrpc: '2.0',
        error: {
          code: 4002,
          message:
            'Leather does not have a Stacks account for this wallet. Add your Stacks account in Leather, then retry the request.',
        },
      });
    });
  });
});
