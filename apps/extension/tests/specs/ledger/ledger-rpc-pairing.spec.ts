import type { BrowserContext, Page } from '@playwright/test';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import {
  getConnectedTestAppPermissionsState,
  makeLedgerTestAccountWalletState,
} from '@tests/page-object-models/onboarding.page';

import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';

import { test } from '../../fixtures/fixtures';

function requestStxTransfer(page: Page) {
  return page.evaluate(
    params =>
      (window as any).LeatherProvider.request('stx_transferStx', params).catch((e: unknown) => e),
    { amount: 100, recipient: TEST_ACCOUNT_2_STX_ADDRESS }
  );
}

async function continueToFullScreenPairing(context: BrowserContext) {
  const popup = await context.waitForEvent('page');

  await popup.locator('text="Approve"').click({ timeout: 20_000 });
  await popup.getByText('Connect Stacks').click();

  await test.expect(popup.getByText('Connect your Ledger in full screen')).toBeVisible();
  await test.expect(popup.getByText("We're unable to connect to your Ledger")).toHaveCount(0);
  await test.expect(popup.getByRole('button', { name: 'Try again' })).toBeVisible();

  const [pairingTab] = await Promise.all([
    context.waitForEvent('page'),
    popup.waitForEvent('close'),
    popup.getByRole('button', { name: 'Open Leather in full screen' }).click(),
  ]);
  return pairingTab;
}

test.describe('Ledger device pairing from an RPC popup', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithLedgerAccount(extensionId, {
      ...makeLedgerTestAccountWalletState(['stacks']),
      ...getConnectedTestAppPermissionsState(),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('sends the user to full screen to connect the device and ends the request', async ({
    page,
    context,
  }) => {
    const [result, pairingTab] = await Promise.all([
      requestStxTransfer(page),
      continueToFullScreenPairing(context),
    ]);

    await test.expect(pairingTab).toHaveURL(/index\.html#\/pair-ledger$/);
    await test.expect(pairingTab.getByRole('button', { name: 'Connect Ledger' })).toBeVisible();
    test.expect(result.error).toEqual({
      code: 4001,
      message: RpcErrorMessage.UserRejectedOperation,
    });
  });
});
