import { type Page, expect } from '@playwright/test';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import { exampleStacksMultisigPublicKeys } from '@tests/mocks/mock-policies';
import { makeLedgerTestAccountWalletState } from '@tests/page-object-models/onboarding.page';

import { test } from '../../fixtures/fixtures';

function openStxAddAccount(page: Page, publicKeys: string[]) {
  return page.evaluate(
    ({ publicKeys }) =>
      void (window as any).LeatherProvider?.request('stx_addAccount', {
        name: 'Shared treasury',
        publicKeys,
        threshold: 2,
      }).catch((e: unknown) => e),
    { publicKeys }
  );
}

test.describe('Rpc: stx_addAccount from a Ledger wallet', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await overrideLaunchDarklyFlags(context, { releaseAddAccount: true });
    await onboardingPage.signInWithLedgerAccount(
      extensionId,
      makeLedgerTestAccountWalletState(['stacks'])
    );
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('verify routes into the ledger flow instead of finalizing inline', async ({
    page,
    context,
  }) => {
    test.slow();

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      openStxAddAccount(page, exampleStacksMultisigPublicKeys),
    ]);
    await popup.waitForLoadState('domcontentloaded');

    await expect(popup.getByText('Verify multisig address')).toBeVisible({ timeout: 20_000 });
    const verifyButton = popup.getByTestId('stx-add-account-approve-button');
    await expect(verifyButton).toHaveText('Verify on Ledger');
    await expect(verifyButton).toBeEnabled({ timeout: 20_000 });
    await verifyButton.click();

    await expect(popup.getByText('Connect & unlock your Ledger')).toBeVisible({
      timeout: 20_000,
    });
  });
});
