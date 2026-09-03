import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { type BrowserContext, type Page, expect } from '@playwright/test';
import { HDKey } from '@scure/bip32';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import {
  exampleStacksMultisigPublicKeys,
  exampleWshDescriptor,
  testAccountNativeSegwitXpub,
} from '@tests/mocks/mock-policies';
import { testFingerprint } from '@tests/page-object-models/onboarding.page';
import { getDisplayerAddress } from '@tests/utils';

import {
  getBondVaultKeys,
  getWshDescriptorAddress,
  instantiateBondDescriptor,
  makeNativeSegwitAccountXpub,
  makeNativeSegwitAddressPubkeyHex,
} from '@leather.io/bitcoin';
import { RpcErrorCode } from '@leather.io/rpc';

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

const bondParams = {
  unlockHeight: 1000,
  hash: bytesToHex(sha256(new Uint8Array([1, 2, 3]))),
  counterpartyKey: `${makeNativeSegwitAccountXpub(9)}/0/0`,
};
const testAccountVaultKeys = getBondVaultKeys(exampleWshDescriptor);
const bondDescriptor = instantiateBondDescriptor({ ...bondParams, ...testAccountVaultKeys });
const singleSignerBondDescriptor = `wsh(and_v(v:or_i(after(${bondParams.unlockHeight}),and_v(v:sha256(${bondParams.hash}),pk(${bondParams.counterpartyKey}))),pk(${testAccountNativeSegwitXpub}/0/0)))`;
const rawCounterpartyBondDescriptor = instantiateBondDescriptor({
  ...bondParams,
  counterpartyKey: makeNativeSegwitAddressPubkeyHex(9),
  ...testAccountVaultKeys,
});
const strangerBondDescriptor = instantiateBondDescriptor({
  ...bondParams,
  threshold: 2,
  keyExpressions: [
    `${makeNativeSegwitAccountXpub(1)}/0/0`,
    `${makeNativeSegwitAccountXpub(2)}/0/0`,
  ],
});
const nonBondMiniscriptDescriptor = `wsh(and_v(v:after(1000),pk(${testAccountNativeSegwitXpub}/0/0)))`;

function deriveFirstAddressPubkeyHex(xpub: string) {
  const { publicKey } = HDKey.fromExtendedKey(xpub).deriveChild(0).deriveChild(0);
  if (!publicKey) throw new Error('Expected a public key');
  return bytesToHex(publicKey);
}
const rawVaultBondDescriptor = `wsh(and_v(v:or_i(after(${bondParams.unlockHeight}),and_v(v:sha256(${bondParams.hash}),pk(${makeNativeSegwitAddressPubkeyHex(9)}))),sortedmulti(2,${deriveFirstAddressPubkeyHex(testAccountNativeSegwitXpub)},${makeNativeSegwitAddressPubkeyHex(2)})))`;

function mainnetAddressOf(descriptor: string) {
  return getWshDescriptorAddress(descriptor, 'mainnet');
}

async function initiateRequestCatchingError(page: Page, method: string, params: unknown) {
  return page.evaluate(
    ({ method, params }) =>
      (window as any).LeatherProvider?.request(method, params).catch((e: unknown) => e),
    { method, params }
  );
}

async function verifyTimelockedAddress(popup: Page) {
  await expect(popup.getByText('Verify timelocked address')).toBeVisible();
  const verifyButton = popup.getByTestId('btc-add-account-approve-button');
  await expect(verifyButton).toHaveText('Verify');
  await expect(verifyButton).toBeEnabled();
  await verifyButton.click();
}

test.describe('Rpc: add account with a timelocked descriptor', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await overrideLaunchDarklyFlags(context, { releaseAddAccount: true });
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('verifies a bond address without registering anything', async ({
    page,
    context,
    extensionId,
  }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'btc_addAccount', {
      name: 'Bond',
      descriptor: bondDescriptor,
    });

    const popup = await waitForPopup(context);
    await expect(popup.getByText('Verify timelocked address')).toBeVisible();
    await expect(popup.getByTestId('btc-add-account-unlock-height')).toHaveText('From block 1000');
    await expect(popup.getByTestId('btc-add-account-vault-policy')).toHaveText(
      'Requires 2 of 2 vault co-signers'
    );
    await expect(popup.getByText("This site can't add accounts")).toHaveCount(0);
    await expect(popup.getByText('Account name')).toHaveCount(0);
    expect(await getDisplayerAddress(popup.locator('body'))).toBe(mainnetAddressOf(bondDescriptor));

    await verifyTimelockedAddress(popup);

    const result = await requestPromise;
    expect(result.result).toEqual({
      added: false,
      role: 'signer',
      descriptor: bondDescriptor,
      address: mainnetAddressOf(bondDescriptor),
    });

    expect(await getPersistedPolicyIds(page, extensionId)).toEqual([]);
  });

  test('only verifies a bond address even from a whitelisted origin', async ({
    page,
    context,
    extensionId,
  }) => {
    await stubWhitelistedOriginPage(context);
    const dappPage = await context.newPage();
    await dappPage.goto(whitelistedOrigin);
    await waitForProvider(dappPage);

    const requestPromise = initiateRequest(dappPage, 'btc_addAccount', {
      name: 'Bond',
      descriptor: bondDescriptor,
    });

    const popup = await waitForPopup(context);
    await verifyTimelockedAddress(popup);

    const result = await requestPromise;
    expect(result.result).toMatchObject({
      added: false,
      address: mainnetAddressOf(bondDescriptor),
    });
    expect(result.result.accountId).toBeUndefined();

    expect(await getPersistedPolicyIds(page, extensionId)).toEqual([]);
  });

  test('verifies a single-signer vault bond owned by the active account', async ({
    page,
    context,
    extensionId,
  }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'btc_addAccount', {
      name: 'Bond',
      descriptor: singleSignerBondDescriptor,
    });

    const popup = await waitForPopup(context);
    await expect(popup.getByTestId('btc-add-account-vault-policy')).toHaveText(
      'Requires 1 of 1 vault co-signers'
    );
    await verifyTimelockedAddress(popup);

    const result = await requestPromise;
    expect(result.result).toMatchObject({
      added: false,
      address: mainnetAddressOf(singleSignerBondDescriptor),
    });

    expect(await getPersistedPolicyIds(page, extensionId)).toEqual([]);
  });

  test('verifies a bond with a raw counterparty key on a software wallet', async ({
    page,
    context,
  }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'btc_addAccount', {
      name: 'Bond',
      descriptor: rawCounterpartyBondDescriptor,
    });

    const popup = await waitForPopup(context);
    await verifyTimelockedAddress(popup);

    const result = await requestPromise;
    expect(result.result).toMatchObject({
      added: false,
      address: mainnetAddressOf(rawCounterpartyBondDescriptor),
    });
  });

  test('verifies a bond whose vault keys are raw public keys', async ({
    page,
    context,
    extensionId,
  }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'btc_addAccount', {
      name: 'RPC test timelocked vault',
      descriptor: rawVaultBondDescriptor,
    });

    const popup = await waitForPopup(context);
    await expect(popup.getByTestId('btc-add-account-vault-policy')).toHaveText(
      'Requires 2 of 2 vault co-signers'
    );
    await expect(popup.getByText('Add multisig account')).toHaveCount(0);
    await verifyTimelockedAddress(popup);

    const result = await requestPromise;
    expect(result.result).toMatchObject({
      added: false,
      address: mainnetAddressOf(rawVaultBondDescriptor),
    });

    expect(await getPersistedPolicyIds(page, extensionId)).toEqual([]);
  });

  test('disables verify when the active account is not a vault signer', async ({
    page,
    context,
  }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateRequest(page, 'btc_addAccount', {
      name: 'Bond',
      descriptor: strangerBondDescriptor,
    });

    const popup = await waitForPopup(context);
    await expect(popup.getByText('Verify timelocked address')).toBeVisible();
    await expect(popup.getByText("isn't connected to this vault")).toBeVisible();
    await expect(popup.getByTestId('btc-add-account-approve-button')).toBeDisabled();

    await popup.close();
    await expect(requestPromise).rejects.toThrow();
  });

  test('rejects a miniscript descriptor that is neither multisig nor a bond', async ({ page }) => {
    await page.goto('localhost:3000');
    const result = await initiateRequestCatchingError(page, 'btc_addAccount', {
      name: 'Not a bond',
      descriptor: nonBondMiniscriptDescriptor,
    });

    expect(result).toMatchObject({
      error: {
        code: RpcErrorCode.INVALID_PARAMS,
        message: 'Only multisig or timelocked wsh() descriptors are supported',
      },
    });
  });
});
