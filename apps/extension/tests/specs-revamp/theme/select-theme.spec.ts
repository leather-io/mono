import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Theme Selection (extensionRevamp)', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that theme selection page is accessible', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-theme').click();

    await test.expect(page).toHaveURL(/.*theme/);
  });

  test('that theme options are displayed', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-theme').click();

    const themeItems = await page.getByTestId('theme-list-item').all();
    test.expect(themeItems.length).toBeGreaterThanOrEqual(2);
  });

  test('that current theme is indicated', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-theme').click();

    const activeTheme = page.getByTestId('theme-list-item').filter({ has: page.locator('[data-active="true"]') });
    await test.expect(activeTheme).toBeVisible();
  });

  test('that user can select dark theme', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-theme').click();

    await page.getByTestId('theme-list-item').filter({ hasText: /dark/i }).click();

    const activeTheme = page.getByTestId('theme-list-item').filter({ hasText: /dark/i });
    await test.expect(activeTheme.locator('[data-active="true"]')).toBeVisible();
  });

  test('that user can select light theme', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-theme').click();

    await page.getByTestId('theme-list-item').filter({ hasText: /light/i }).click();

    const activeTheme = page.getByTestId('theme-list-item').filter({ hasText: /light/i });
    await test.expect(activeTheme.locator('[data-active="true"]')).toBeVisible();
  });

  test('that user can select system theme', async ({ page }) => {
    await page.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await page.getByTestId('settings-menu-item').click();
    await page.getByTestId('settings-theme').click();

    const systemTheme = page.getByTestId('theme-list-item').filter({ hasText: /system/i });
    if (await systemTheme.isVisible()) {
      await systemTheme.click();
      await test.expect(systemTheme.locator('[data-active="true"]')).toBeVisible();
    }
  });
});
