import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';

import { test } from '../../fixtures/fixtures';

test.describe('Network Selection (extensionRevamp)', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that network selection page shows all default networks', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-network').click();

    const networkListItems = await page.getByTestId(SettingsSelectors.NetworkListItem).all();
    test
      .expect(networkListItems)
      .toHaveLength(Object.keys(WalletDefaultNetworkConfigurationIds).length);
  });

  test('that current network is indicated', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-network').click();

    const currentNetwork = page.getByTestId('current-network-indicator');
    await test.expect(currentNetwork).toBeVisible();
  });

  test('that user can switch to testnet', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-network').click();

    await page
      .getByTestId(SettingsSelectors.NetworkListItem)
      .filter({ hasText: /testnet/i })
      .click();

    await page.waitForURL('**/home');
    const networkBadge = page.getByTestId('network-mode-badge');
    await test.expect(networkBadge).toContainText(/test/i);
  });

  test('that add network button is visible', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-network').click();

    const addNetworkBtn = page.getByTestId('add-network-btn');
    await test.expect(addNetworkBtn).toBeVisible();
  });

  test('that show network badge toggle works', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-network').click();

    const showBadgeSwitch = page.getByTestId('show-network-badge-switch');
    await test.expect(showBadgeSwitch).toBeVisible();
  });
});
