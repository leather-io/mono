import { expect } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';

import { test } from '../../fixtures/fixtures';

const zeroStxBalance = { balance: '0', available: '0', locked: null, mempool: null };

const emptyFtBalances = {
  limit: 200,
  total: 0,
  cursor: { next: null, previous: null, current: null },
  results: [],
};

test.describe('Sign out with multiple software wallets', () => {
  test('that sign out demands a backup confirmation for every software wallet', async ({
    extensionId,
    globalPage,
    onboardingPage,
    switchAccountPage,
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

    await onboardingPage.signUpNewUser(TEST_PASSWORD);

    await switchAccountPage.open();
    await switchAccountPage.addNewWallet(TEST_PASSWORD);

    await homePage.clickSettingsButton();
    await homePage.signOutSettingsListItem.click();

    await expect(page.getByText("You'll need your Secret Keys to sign in again")).toBeVisible();
    await expect(homePage.signOutConfirmHasBackupCheckboxes).toHaveCount(2);
    await expect(page.getByText('I have backed up the Secret Key for Wallet 1.')).toBeVisible();
    await expect(page.getByText('I have backed up the Secret Key for Wallet 2.')).toBeVisible();

    await expect(homePage.signOutDeleteWalletBtn).toBeDisabled();

    await homePage.signOutConfirmHasBackupCheckboxes.nth(0).check();
    await homePage.signOutConfirmPasswordDisable.check();
    await expect(homePage.signOutDeleteWalletBtn).toBeDisabled();

    await homePage.signOutConfirmHasBackupCheckboxes.nth(1).check();
    await expect(homePage.signOutDeleteWalletBtn).toBeEnabled();

    await homePage.signOutDeleteWalletBtn.click();
    await page.waitForURL('**/get-started');
    await expect(page.getByTestId(OnboardingSelectors.SignUpBtn)).toBeVisible();
  });
});
