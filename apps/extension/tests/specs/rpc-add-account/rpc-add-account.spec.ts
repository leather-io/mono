import { type BrowserContext, type Page, expect } from '@playwright/test';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import { exampleStacksMultisigPublicKeys, exampleWshDescriptor } from '@tests/mocks/mock-policies';
import { testFingerprint } from '@tests/page-object-models/onboarding.page';

import { test } from '../../fixtures/fixtures';

// The active test account co-signs this Stacks multisig — its STX public key is
// the first entry, which is what the verify approver checks before enabling.
const testAccountStxPublicKey = exampleStacksMultisigPublicKeys[0];
const cosignerPublicKey = exampleStacksMultisigPublicKeys[1];
// A valid compressed key the active account does not control (its BTC native
// segwit public key), used to build a multisig the account is not a signer of.
const strangerPublicKey = '030347be500a8b2707a00e7576c0c527a247cddc6e8363ee51147b8e43b590baa9';

async function initiateRequest(page: Page, method: string, params: unknown) {
  return page.evaluate(
    ({ method, params }) => (window as any).LeatherProvider?.request(method, params),
    { method, params }
  );
}

async function waitForPopup(context: BrowserContext) {
  const popup = await context.waitForEvent('page');
  await popup.waitForLoadState('domcontentloaded');
  return popup;
}

// `window.debug` only exists on the extension origin, so return to it (the dApp
// page navigated away to localhost:3000) before reading the persisted store.
async function getPersistedPolicyIds(page: Page, extensionId: string) {
  await page.goto(`chrome-extension://${extensionId}/index.html`);
  await page.waitForFunction(() => typeof window.debug?.getPersistedStore === 'function');
  return page.evaluate(async () => {
    const store = await window.debug.getPersistedStore();
    return (store as { policy?: { ids?: string[] } } | undefined)?.policy?.ids ?? [];
  });
}

test.describe('Rpc: add account in verify mode (non-whitelisted origin)', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // The add-account approver is gated behind `releaseAddAccount`; enable it so
    // the popup renders instead of rejecting as unsupported.
    await overrideLaunchDarklyFlags(context, { releaseAddAccount: true });
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('verifies a Stacks multisig address without registering it', async ({
    page,
    context,
    extensionId,
  }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'stx_addAccount', {
      name: 'Shared treasury',
      publicKeys: [testAccountStxPublicKey, cosignerPublicKey],
      threshold: 2,
    });

    const popup = await waitForPopup(context);
    await expect(popup.getByText('Verify multisig address')).toBeVisible();
    const verifyButton = popup.getByTestId('stx-add-account-approve-button');
    await expect(verifyButton).toHaveText('Verify');
    await expect(verifyButton).toBeEnabled();
    await verifyButton.click();

    const result = await requestPromise;
    expect(result.result).toMatchObject({
      added: false,
      role: 'signer',
      threshold: 2,
      publicKeys: [testAccountStxPublicKey, cosignerPublicKey],
    });
    expect(typeof result.result.address).toBe('string');
    expect(result.result.accountId).toBeUndefined();

    // Verify mode must not write anything to the wallet
    expect(await getPersistedPolicyIds(page, extensionId)).toEqual([]);
  });

  test('disables verify when the active account is not a co-signer', async ({ page, context }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'stx_addAccount', {
      name: 'Not my vault',
      publicKeys: [cosignerPublicKey, strangerPublicKey],
      threshold: 2,
    });

    const popup = await waitForPopup(context);
    await expect(popup.getByText('Verify multisig address')).toBeVisible();
    await expect(popup.getByTestId('stx-add-account-approve-button')).toBeDisabled();

    await popup.close();
    await expect(requestPromise).rejects.toThrow();
  });

  test('verifies a Bitcoin multisig address without registering it', async ({
    page,
    context,
    extensionId,
  }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'btc_addAccount', {
      name: 'Shared cold storage',
      descriptor: exampleWshDescriptor,
    });

    const popup = await waitForPopup(context);
    await expect(popup.getByText('Verify multisig address')).toBeVisible();
    const verifyButton = popup.getByTestId('btc-add-account-approve-button');
    await expect(verifyButton).toHaveText('Verify');
    await expect(verifyButton).toBeEnabled();
    await verifyButton.click();

    const result = await requestPromise;
    expect(result.result).toMatchObject({
      added: false,
      role: 'signer',
      descriptor: exampleWshDescriptor,
    });
    expect(result.result.address).toMatch(/^bc1q/);
    expect(result.result.accountId).toBeUndefined();

    expect(await getPersistedPolicyIds(page, extensionId)).toEqual([]);
  });
});

const whitelistedOrigin = 'https://app.leather.io';

async function stubWhitelistedOriginPage(context: BrowserContext) {
  await context.route(
    url => url.hostname === 'app.leather.io',
    route =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html><head><title>Leather</title></head><body></body></html>',
      })
  );
}

async function waitForProvider(page: Page) {
  await page.waitForFunction(() =>
    Boolean((window as { LeatherProvider?: unknown }).LeatherProvider)
  );
}

async function readPersistedPolicyIds(page: Page) {
  return page.evaluate(async () => {
    const store = await window.debug.getPersistedStore();
    return (store as { policy?: { ids?: string[] } } | undefined)?.policy?.ids ?? [];
  });
}

test.describe('Rpc: add account in add mode (whitelisted origin)', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await overrideLaunchDarklyFlags(context, { releaseAddAccount: true });
    await stubWhitelistedOriginPage(context);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('registers a Bitcoin multisig and persists it', async ({ page, context }) => {
    const dappPage = await context.newPage();
    await dappPage.goto(whitelistedOrigin);
    await waitForProvider(dappPage);

    const requestPromise = initiateRequest(dappPage, 'btc_addAccount', {
      name: 'Shared cold storage',
      descriptor: exampleWshDescriptor,
    });

    const popup = await waitForPopup(context);
    await expect(popup.getByText('Add multisig account')).toBeVisible();
    const confirmButton = popup.getByTestId('btc-add-account-approve-button');
    await expect(confirmButton).toHaveText('Confirm');
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    const result = await requestPromise;
    expect(result.result).toMatchObject({
      added: true,
      role: 'signer',
      descriptor: exampleWshDescriptor,
    });
    expect(result.result.address).toMatch(/^bc1q/);
    expect(result.result.accountId).toBe(result.result.address);

    const expectedPolicyId = `${testFingerprint}/0/${result.result.address}/mainnet`;
    await expect.poll(() => readPersistedPolicyIds(page)).toEqual([expectedPolicyId]);
  });
});

test.describe('Rpc: add account when the feature is disabled', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('rejects stx_addAccount as unsupported', async ({ page }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'stx_addAccount', {
      name: 'Shared treasury',
      publicKeys: [testAccountStxPublicKey, cosignerPublicKey],
      threshold: 2,
    });

    await expect(requestPromise).rejects.toThrow();
  });
});
