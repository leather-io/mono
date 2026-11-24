import { expect } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

const zeroStxBalance = { balance: '0', available: '0', locked: null, mempool: null };

const emptyFtBalances = {
  limit: 200,
  total: 0,
  cursor: { next: null, previous: null, current: null },
  results: [],
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
    await page.route('**hiro.so/extended/v3/principals/**/balances/stx', route =>
      route.fulfill({ json: zeroStxBalance })
    );
    await page.route('**hiro.so/extended/v3/principals/**/balances/ft**', route =>
      route.fulfill({ json: emptyFtBalances })
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
    await homePage.unlock(passwordB);

    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible();
  });
});
