import { type Page, expect } from '@playwright/test';
import { base64, base64urlnopad } from '@scure/base';

import { rpName, userLabelPrefix } from '../../src/u0-biometric-unlock-harness/webauthn-prf';
import {
  attachPrfVirtualAuthenticator,
  detachVirtualAuthenticator,
} from '../fixtures/biometric-authenticator';
import { test } from '../fixtures/fixtures';

const expectedBiometricUnlockU0ExtensionId = 'kdmjaicljefdpoacaidpmbigaecgohci';

async function expectResult(page: Page, result: string) {
  await expect(page.getByTestId('status')).toHaveAttribute('data-result', result);
}

async function readActiveCredentialId(page: Page) {
  return page.evaluate(async () => {
    const stored = await chrome.storage.local.get('biometricUnlockU0Enrollment');
    const enrollment: unknown = stored.biometricUnlockU0Enrollment;
    if (typeof enrollment !== 'object' || enrollment === null || !('active' in enrollment)) {
      throw new Error('Active enrollment is unavailable');
    }
    const active: unknown = enrollment.active;
    if (typeof active !== 'object' || active === null || !('credentialId' in active)) {
      throw new Error('Active credential is unavailable');
    }
    const credentialId: unknown = active.credentialId;
    if (typeof credentialId !== 'string') throw new Error('Active credential ID is invalid');
    return credentialId;
  });
}

test.skip(process.env.BIOMETRIC_UNLOCK_U0 !== 'true');

test.describe('Biometric unlock U0 extension-origin harness', () => {
  test('proves PRF evaluation, exact credential pinning, fixture atomicity, and real popup classification', async ({
    context,
    extensionId,
    page,
  }) => {
    test.slow();
    expect(extensionId).toBe(expectedBiometricUnlockU0ExtensionId);
    const authenticator = await attachPrfVirtualAuthenticator(page);
    await page.goto(`chrome-extension://${extensionId}/index.html`);

    await expect(page).toHaveURL(/^chrome-extension:\/\//);
    await expect(page.getByTestId('preflight')).toContainText('WebAuthn: present');
    await expect(page.getByTestId('context-evidence')).toContainText('real popup view: false');

    await page.getByTestId('create-credential').click();
    await expectResult(page, 'enrollment-succeeded');
    const firstCredentials = await authenticator.client.send('WebAuthn.getCredentials', {
      authenticatorId: authenticator.authenticatorId,
    });
    expect(firstCredentials.credentials).toHaveLength(1);
    expect(firstCredentials.credentials[0]?.userName).toMatch(
      new RegExp(`^${userLabelPrefix} · [A-HJ-NP-Z2-9]{6}$`)
    );
    expect(firstCredentials.credentials[0]?.userDisplayName).toBe(
      firstCredentials.credentials[0]?.userName
    );
    expect(firstCredentials.credentials[0]?.rpId).toBe(`chrome-extension://${extensionId}`);
    expect(rpName).not.toContain(extensionId);

    await page.getByTestId('evaluate-pinned').click();
    await expectResult(page, 'assertion-succeeded');
    await page.getByTestId('compare-same').click();
    await expectResult(page, 'same-input-stable');
    await page.getByTestId('compare-alternate').click();
    await expectResult(page, 'alternate-input-different');

    await page.getByTestId('run-fixture').click();
    await expectResult(page, 'fixture-persisted');
    await page.getByTestId('unlock-fixture').click();
    await expectResult(page, 'fixture-unlocked');
    const localStorageJson = await page.evaluate(async () =>
      JSON.stringify(await chrome.storage.local.get())
    );
    const sessionStorageJson = await page.evaluate(async () =>
      JSON.stringify(await chrome.storage.session.get())
    );
    expect(localStorageJson).toContain('biometric-only');
    expect(localStorageJson).not.toContain('abandon abandon');
    expect(localStorageJson).not.toContain('walletEncryptionKey');
    expect(localStorageJson).not.toContain('prfOutput');
    expect(localStorageJson).not.toContain('password');
    expect(localStorageJson).not.toContain('salt');
    expect(sessionStorageJson).toBe('{"biometricUnlockU0SessionReady":true}');

    await page.getByTestId('create-credential').click();
    await expectResult(page, 'enrollment-succeeded');
    const secondCredentials = await authenticator.client.send('WebAuthn.getCredentials', {
      authenticatorId: authenticator.authenticatorId,
    });
    expect(secondCredentials.credentials).toHaveLength(2);
    const activeCredentialId = base64.encode(
      base64urlnopad.decode(await readActiveCredentialId(page))
    );
    expect(secondCredentials.credentials.map(credential => credential.credentialId)).toContain(
      activeCredentialId
    );
    const activeConfigBeforeForcedFailure = await page.evaluate(async () => {
      const stored = await chrome.storage.local.get('biometricUnlockU0Enrollment');
      return JSON.stringify(stored.biometricUnlockU0Enrollment);
    });

    await page.getByTestId('force-orphan').check();
    await page.getByTestId('create-credential').click();
    await expectResult(page, 'orphan-created');
    const credentialsWithOrphan = await authenticator.client.send('WebAuthn.getCredentials', {
      authenticatorId: authenticator.authenticatorId,
    });
    expect(credentialsWithOrphan.credentials).toHaveLength(3);
    const activeConfigAfterForcedFailure = await page.evaluate(async () => {
      const stored = await chrome.storage.local.get('biometricUnlockU0Enrollment');
      return JSON.stringify(stored.biometricUnlockU0Enrollment);
    });
    expect(activeConfigAfterForcedFailure).toBe(activeConfigBeforeForcedFailure);

    await authenticator.client.send('WebAuthn.removeCredential', {
      authenticatorId: authenticator.authenticatorId,
      credentialId: activeCredentialId,
    });
    await page.getByTestId('evaluate-pinned').click();
    await expect(page.getByTestId('status')).not.toHaveAttribute(
      'data-result',
      'assertion-succeeded'
    );
    const remainingCredentials = await authenticator.client.send('WebAuthn.getCredentials', {
      authenticatorId: authenticator.authenticatorId,
    });
    expect(remainingCredentials.credentials).toHaveLength(2);

    await page.getByTestId('swap-active').click();
    await expectResult(page, 'active-swapped');
    await page.getByTestId('evaluate-pinned').click();
    await expectResult(page, 'assertion-succeeded');

    await page.getByTestId('clear-harness').click();
    await expectResult(page, 'cleared');
    const directActionPage = await context.newPage();
    await directActionPage.goto(`chrome-extension://${extensionId}/action-popup.html`);
    await expect(directActionPage.getByTestId('context-evidence')).toContainText(
      'real popup view: false'
    );

    await page.getByTestId('open-action-popup').click();
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const stored = await chrome.storage.session.get('biometricUnlockU0PopupClassifier');
          return stored.biometricUnlockU0PopupClassifier;
        })
      )
      .toBe(true);

    await detachVirtualAuthenticator(authenticator);
  });
});
