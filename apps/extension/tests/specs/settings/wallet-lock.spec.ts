import { expect } from '@playwright/test';
import { GlobalPage } from '@tests/page-object-models/global.page';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Wallet lock', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that locking the wallet clears in-memory keys and locks other open windows', async ({
    context,
    extensionId,
    homePage,
    page,
  }) => {
    test.slow();
    const otherWindow = await context.newPage();
    const otherWindowGlobalPage = new GlobalPage(otherWindow);
    await otherWindowGlobalPage.setupAndUseApiCalls(extensionId);
    await otherWindow.getByTestId(SettingsSelectors.CurrentAccountDisplayName).waitFor();

    await homePage.lock();

    await expect(otherWindow.getByTestId(SettingsSelectors.EnterPasswordInput)).toBeVisible({
      timeout: 15000,
    });
    expect(otherWindow.isClosed()).toBe(false);

    const { encryptionKey } = await page.evaluate(() =>
      chrome.storage.session.get(['encryptionKey'])
    );
    expect(encryptionKey).toBeUndefined();
  });

  test('that a locked wallet can still sign out and shows the backup confirmations', async ({
    homePage,
    page,
  }) => {
    await homePage.lock();
    await page.getByTestId(SettingsSelectors.EnterPasswordInput).waitFor();

    await homePage.clickSettingsButton();
    await expect(homePage.signOutSettingsListItem).toBeVisible();
    await homePage.signOutSettingsListItem.click();

    await expect(homePage.signOutConfirmHasBackupCheckbox).toBeVisible();
    await expect(homePage.signOutConfirmPasswordDisable).toBeVisible();
    await expect(homePage.signOutDeleteWalletBtn).toBeDisabled();

    await homePage.signOutConfirmHasBackupCheckbox.click();
    await homePage.signOutConfirmPasswordDisable.click();
    await homePage.signOutDeleteWalletBtn.click();

    await page.waitForURL('**/get-started');
    await expect(page.getByTestId(OnboardingSelectors.SignUpBtn)).toBeVisible();
  });
});
