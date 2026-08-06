import { type Page, expect } from '@playwright/test';
import { TEST_PASSWORD } from '@tests/mocks/constants';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import {
  attachPrfVirtualAuthenticator,
  detachVirtualAuthenticator,
} from '../../fixtures/biometric-authenticator';
import { test } from '../../fixtures/fixtures';

async function auditLocalStorage(page: Page) {
  return page.evaluate(async () => {
    const stored = await chrome.storage.local.get();
    const propertyNames: string[] = [];
    const stringValues: string[] = [];
    function visit(value: unknown) {
      if (typeof value === 'string') {
        stringValues.push(value);
        return;
      }
      if (typeof value !== 'object' || value === null) return;
      for (const [key, nested] of Object.entries(value)) {
        propertyNames.push(key);
        visit(nested);
      }
    }
    visit(stored);
    return { propertyNames, stringValues };
  });
}

test.describe('Biometric unlock', () => {
  test('enrolls, unlocks the complete wallet, and disables without changing wallet data', async ({
    extensionId,
    globalPage,
    onboardingPage,
    page,
    settingsPage,
  }) => {
    test.slow();
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    const authenticator = await attachPrfVirtualAuthenticator(page);

    await settingsPage.openSettingsPage();
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockListItem)).toContainText('Off');
    await page.getByTestId(SettingsSelectors.BiometricUnlockListItem).click();
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockPage)).toContainText(
      'every software wallet in this profile'
    );
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockPage)).toContainText(
      'passkey may sync through your provider'
    );
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockPage)).toContainText(
      'prompt automatically when you open it while locked'
    );
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockPage)).toContainText(
      'Anyone who can unlock your user account can unlock Leather'
    );
    await page.getByTestId(SettingsSelectors.BiometricUnlockPasswordInput).fill(TEST_PASSWORD);
    await page.getByTestId(SettingsSelectors.BiometricUnlockSubmit).click();
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockPage)).toContainText('On', {
      timeout: 30000,
    });
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockPage)).toContainText(
      /Passkey label: Leather biometric unlock · [A-HJ-NP-Z2-9]{6}/
    );

    const enrolledStorage = await auditLocalStorage(page);
    expect(enrolledStorage.propertyNames).toContain('platformUnlock');
    expect(enrolledStorage.propertyNames).not.toContain('prfOutput');
    expect(enrolledStorage.propertyNames).not.toContain('walletEncryptionKey');
    expect(enrolledStorage.stringValues.some(value => value.includes(TEST_PASSWORD))).toBe(false);
    expect(enrolledStorage.stringValues.some(value => /^[0-9a-f]{96}$/.test(value))).toBe(false);

    await page.goto(`chrome-extension://${extensionId}/index.html`);
    await settingsPage.openViewSecretKeyPage();
    await expect(page.getByTestId(SettingsSelectors.CopyKeyToClipboardBtn)).toBeVisible({
      timeout: 15000,
    });

    await page.goto(`chrome-extension://${extensionId}/index.html`);
    await settingsPage.openSettingsPage();
    await page.getByTestId(SettingsSelectors.LockListItem).click();
    await expect(page.getByRole('button', { name: 'Unlock with biometrics' })).toBeVisible();
    await page.getByRole('button', { name: 'Unlock with biometrics' }).click();
    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible();

    await settingsPage.openSettingsPage();
    await page.getByTestId(SettingsSelectors.BiometricUnlockListItem).click();
    await page.getByTestId(SettingsSelectors.BiometricUnlockDisable).click();
    await page.getByRole('button', { exact: true, name: 'Disable' }).last().click();
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockPage)).toContainText('Off');

    const disabledStorage = await auditLocalStorage(page);
    expect(disabledStorage.propertyNames).not.toContain('platformUnlock');
    expect(disabledStorage.propertyNames).toContain('encryptedSecretKey');
    expect(disabledStorage.stringValues.some(value => value.includes(TEST_PASSWORD))).toBe(false);

    await detachVirtualAuthenticator(authenticator);
  });

  test('creates and unlocks a first biometric-only software wallet without a password', async ({
    extensionId,
    globalPage,
    onboardingPage,
    page,
    settingsPage,
  }) => {
    test.slow();
    await globalPage.setupAndUseApiCalls(extensionId);
    await page.evaluate(async () => {
      await chrome.storage.local.clear();
      await chrome.storage.session.clear();
    });
    await page.goto(`chrome-extension://${extensionId}/index.html#/get-started`);
    const authenticator = await attachPrfVirtualAuthenticator(page);

    await page.getByTestId(OnboardingSelectors.SignUpBtn).click();
    await page.getByTestId(OnboardingSelectors.BackUpSecretKeyBtn).click();
    await expect(page.getByTestId(OnboardingSelectors.NewPasswordInput)).toBeVisible();
    await page.getByTestId(OnboardingSelectors.BiometricSetupBtn).click();
    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible({
      timeout: 30000,
    });
    await onboardingPage.dismissFeatureIntroducer();

    const biometricState = await auditLocalStorage(page);
    expect(biometricState.stringValues).toContain('biometric-only');
    expect(biometricState.propertyNames).toContain('platformUnlock');
    expect(biometricState.propertyNames).not.toContain('salt');
    expect(biometricState.propertyNames).not.toContain('prfOutput');
    expect(biometricState.stringValues.some(value => /^[0-9a-f]{96}$/.test(value))).toBe(false);

    await settingsPage.openSettingsPage();
    await page.getByTestId(SettingsSelectors.LockListItem).click();
    await expect(page.getByTestId(SettingsSelectors.EnterPasswordInput)).not.toBeVisible();
    await page.getByRole('button', { name: 'Unlock with biometrics' }).click();
    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible();

    await detachVirtualAuthenticator(authenticator);
  });

  test('transitions biometric-only state across two live extension pages', async ({
    context,
    extensionId,
    globalPage,
    onboardingPage,
    page,
    settingsPage,
  }) => {
    test.slow();
    await globalPage.setupAndUseApiCalls(extensionId);
    await page.evaluate(async () => {
      await chrome.storage.local.clear();
      await chrome.storage.session.clear();
    });
    await page.goto(`chrome-extension://${extensionId}/index.html#/get-started`);
    const authenticator = await attachPrfVirtualAuthenticator(page);

    await page.getByTestId(OnboardingSelectors.SignUpBtn).click();
    await page.getByTestId(OnboardingSelectors.BackUpSecretKeyBtn).click();
    await page.getByTestId(OnboardingSelectors.BiometricSetupBtn).click();
    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible({
      timeout: 30000,
    });
    await onboardingPage.dismissFeatureIntroducer();

    const stalePage = await context.newPage();
    await stalePage.goto(`chrome-extension://${extensionId}/index.html`);
    await expect(stalePage.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible();

    await settingsPage.openSettingsPage();
    await page.getByTestId(SettingsSelectors.BiometricUnlockListItem).click();
    await page.getByTestId(SettingsSelectors.BiometricUnlockSetPassword).click();
    await page.getByTestId(SettingsSelectors.BiometricUnlockPasswordInput).fill(TEST_PASSWORD);
    await page.getByTestId(SettingsSelectors.BiometricUnlockSubmit).click();
    await expect(page.getByTestId(SettingsSelectors.BiometricUnlockDisable)).toBeVisible({
      timeout: 30000,
    });

    await stalePage.getByTestId(SettingsSelectors.SettingsMenuBtn).click();
    await stalePage.getByTestId(SettingsSelectors.SettingsMenuItem).click();
    await stalePage.getByTestId(SettingsSelectors.BiometricUnlockListItem).click();
    await expect(stalePage.getByTestId(SettingsSelectors.BiometricUnlockDisable)).toBeVisible();
    await expect(stalePage.getByTestId(SettingsSelectors.BiometricUnlockSetPassword)).toHaveCount(
      0
    );

    await stalePage.close();
    await detachVirtualAuthenticator(authenticator);
  });
});
