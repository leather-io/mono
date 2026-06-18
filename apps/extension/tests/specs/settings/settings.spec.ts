import { TEST_PASSWORD } from '@tests/mocks/constants';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { LEATHER_GUIDES_URL } from '@leather.io/constants';
import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';

import { test } from '../../fixtures/fixtures';

test.describe('Settings menu', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that menu item takes user to support page', async ({ page, settingsPage }) => {
    await settingsPage.openSettingsPage();

    const [supportPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByTestId(SettingsSelectors.GetSupportMenuItem).click(),
    ]);

    await test.expect(supportPage).toHaveURL(LEATHER_GUIDES_URL);
  });

  test('that menu item can perform sign out', async ({ homePage, onboardingPage }) => {
    await homePage.signOut();
    const button = onboardingPage.page.getByTestId(OnboardingSelectors.SignUpBtn);
    test.expect(button).toBeTruthy();
  });

  test('that menu item can lock and unlock the extension', async ({ homePage, page }) => {
    await homePage.lock();

    await page.getByTestId(SettingsSelectors.EnterPasswordInput).fill(TEST_PASSWORD);
    await page.getByTestId(SettingsSelectors.UnlockWalletBtn).click();

    const displayName = await page
      .getByTestId(SettingsSelectors.CurrentAccountDisplayName)
      .innerText();

    test.expect(displayName).toEqual('Account 1');
  });

  test('that menu item allows viewing and saving secret key to clipboard', async ({
    page,
    settingsPage,
  }) => {
    await settingsPage.openViewSecretKeyPage();
    await page.getByTestId(SettingsSelectors.EnterPasswordInput).fill(TEST_PASSWORD);
    await page.getByTestId(SettingsSelectors.UnlockWalletBtn).click();
    await page.getByTestId(SettingsSelectors.CopyKeyToClipboardBtn).click();

    const copySuccessMessage = await page
      .getByTestId(SettingsSelectors.CopyKeyToClipboardBtn)
      .innerText();

    test.expect(copySuccessMessage).toContain('Copied!');
  });

  test('that menu item allows changing networks', async ({ networkPage, settingsPage, page }) => {
    await page.getByTestId(HomePageSelectors.NetworkSwitcher).isHidden();
    await networkPage.changeNetwork(WalletDefaultNetworkConfigurationIds.testnet4);
    await settingsPage.openSettingsPage();
    await page.getByTestId(HomePageSelectors.NetworkSwitcher).isVisible();
    const currentNetwork = await page.getByTestId(HomePageSelectors.NetworkSwitcher).innerText();

    test.expect(currentNetwork).toContain('Testnet4');
  });

  test('that menu item can toggle privacy', async ({ page, homePage }) => {
    const visibleBalanceText = await homePage.page
      .getByTestId(SharedComponentsSelectors.AccountCardBalanceText)
      .innerText();
    test.expect(visibleBalanceText).toBeTruthy();

    await homePage.clickSettingsButton();
    await page.getByTestId(SettingsSelectors.TogglePrivacy).click();

    await test
      .expect(homePage.page.getByTestId(SharedComponentsSelectors.AccountCardBalanceText))
      .toContainText('***');
  });

  test('that menu item opens the account selection sheet', async ({ page, settingsPage }) => {
    await settingsPage.openSettingsMenu();
    await page.getByTestId(SettingsSelectors.SwitchAccountMenuItem).click();

    await test.expect(page.getByRole('heading', { name: 'Select account' })).toBeVisible();
    await test.expect(page.getByRole('button', { name: 'Add wallet' })).toBeVisible();
    await test.expect(page.getByRole('button', { name: 'Manage' })).toBeVisible();
  });
});
