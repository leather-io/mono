import { type Page, expect } from '@playwright/test';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import {
  attachPrfVirtualAuthenticator,
  detachVirtualAuthenticator,
  removeVirtualAuthenticatorCredentials,
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

test.describe('Exclusive wallet authentication', () => {
  test('keeps an existing password profile password-only', async ({
    extensionId,
    globalPage,
    onboardingPage,
    page,
    settingsPage,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);

    await settingsPage.openSettingsPage();
    await expect(page.getByText('Biometric unlock', { exact: true })).toHaveCount(0);
    await page.getByTestId(SettingsSelectors.LockListItem).click();
    await expect(page.getByTestId(SettingsSelectors.EnterPasswordInput)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unlock with biometrics' })).toHaveCount(0);
  });

  test('creates and unlocks a biometric-only profile with recovery disclosure', async ({
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
    await expect(
      page.getByText(
        "Biometrics will be your only local unlock method. If biometrics become unavailable, you'll need your Secret Key to restore your wallet."
      )
    ).toBeVisible();
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
    await expect(page.getByText('Biometric unlock', { exact: true })).toHaveCount(0);
    await page.getByTestId(SettingsSelectors.LockListItem).click();
    await expect(page.getByTestId(SettingsSelectors.EnterPasswordInput)).toHaveCount(0);
    await page.getByRole('button', { name: 'Unlock with biometrics' }).click();
    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible();

    await settingsPage.openSettingsPage();
    await page.getByTestId(SettingsSelectors.LockListItem).click();
    await removeVirtualAuthenticatorCredentials(authenticator);
    await page.getByRole('button', { name: 'Unlock with biometrics' }).click();
    await expect(page.getByRole('button', { name: 'Try biometric unlock again' })).toBeVisible();
    await expect(page.getByTestId(SettingsSelectors.EnterPasswordInput)).toHaveCount(0);
    await page.getByRole('button', { name: "Can't use biometrics?" }).click();
    await expect(page.getByText("You'll need your Secret Key to sign in again")).toBeVisible();

    await detachVirtualAuthenticator(authenticator);
  });

  test('uses biometrics to add another wallet to a biometric-only profile', async ({
    extensionId,
    globalPage,
    onboardingPage,
    page,
    switchAccountPage,
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

    await switchAccountPage.open();
    await switchAccountPage.createNewWallet();
    await page.getByTestId(OnboardingSelectors.BackUpSecretKeyBtn).click();
    await expect(page.getByTestId(SettingsSelectors.CurrentAccountDisplayName)).toBeVisible({
      timeout: 30000,
    });

    await switchAccountPage.open();
    expect(await switchAccountPage.getWalletCount()).toBe(2);

    await detachVirtualAuthenticator(authenticator);
  });
});
