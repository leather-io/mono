import { TEST_PASSWORD } from '@tests/mocks/constants';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Settings Page (extensionRevamp)', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that settings page is accessible via menu', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();

    await test.expect(page).toHaveURL(/.*settings/);
  });

  test('that settings page shows all menu options', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();

    const secretKeyOption = page.getByTestId('settings-secret-key');
    const themeOption = page.getByTestId('settings-theme');
    const networkOption = page.getByTestId('settings-network');

    await test.expect(secretKeyOption).toBeVisible();
    await test.expect(themeOption).toBeVisible();
    await test.expect(networkOption).toBeVisible();
  });

  test('that user can navigate to secret key from settings page', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-secret-key').click();

    await test.expect(page.getByTestId(SettingsSelectors.EnterPasswordInput)).toBeVisible();
  });

  test('that user can navigate to theme selection', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-theme').click();

    await test.expect(page).toHaveURL(/.*theme/);
  });

  test('that user can navigate to network selection', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-network').click();

    await test.expect(page).toHaveURL(/.*network/);
  });

  test('that lock button works from settings page', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-lock-btn').click();

    await test.expect(page.getByTestId(SettingsSelectors.EnterPasswordInput)).toBeVisible();
  });

  test('that sign out button works from settings page', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-sign-out-btn').click();

    await test.expect(page.getByTestId('sign-up-btn')).toBeVisible();
  });

  test('that app version is displayed on settings page', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();

    const versionText = page.getByTestId('app-version');
    await test.expect(versionText).toBeVisible();
  });
});
