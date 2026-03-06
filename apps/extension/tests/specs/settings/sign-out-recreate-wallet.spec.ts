import { expect } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

const zeroStxBalance = {
  balance: '0',
  total_miner_rewards_received: '0',
  lock_tx_id: '',
  locked: '0',
  lock_height: 0,
  burnchain_lock_height: 0,
  burnchain_unlock_height: 0,
};

test.describe('Recreate wallet after sign out', () => {
  test('that a wallet created after signing out unlocks with its own password', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
    page,
  }) => {
    test.slow();

    await globalPage.setupAndUseApiCalls(extensionId);
    await page.route('**hiro.so/extended/v2/addresses/**/balances/stx', route =>
      route.fulfill({ json: zeroStxBalance })
    );
    await page.route('**hiro.so/extended/v2/addresses/**/balances/ft', route =>
      route.fulfill({ json: { limit: 100, offset: 0, total: 0, results: [] } })
    );
    await globalPage.page.evaluate(async () => {
      await chrome.storage.local.clear();
    });

    const passwordA = TEST_PASSWORD;
    const passwordB = 'th3_s3cond_p@ssw0rd';

    await onboardingPage.signUpNewUser(passwordA);

    await homePage.signOut();
    await page.waitForURL('**/get-started');

    await onboardingPage.signUpNewUser(passwordB);

    await homePage.lock();

    const passwordInput = page.getByTestId(SettingsSelectors.EnterPasswordInput);
    await passwordInput.waitFor();
    await passwordInput.fill(passwordB);
    await page.getByTestId(SettingsSelectors.UnlockWalletBtn).click();

    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible();
  });
});
