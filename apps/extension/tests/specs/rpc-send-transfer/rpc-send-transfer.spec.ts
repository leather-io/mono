import { BrowserContext, Page } from '@playwright/test';
import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_2_TAPROOT_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
} from '@tests/mocks/constants';
import { mockTestAccountBtcBroadcastTransaction } from '@tests/mocks/mock-bitcoin-tx';
import { mockLeatherApiRequests } from '@tests/mocks/mock-leather-api';
import { makeBitcoinPolicy, policyStateOverrides } from '@tests/mocks/mock-policies';
import { mockFundedBitcoinAddressUtxos } from '@tests/mocks/mock-utxos';
import {
  getConnectedTestAppPermissionsState,
  testFingerprint,
} from '@tests/page-object-models/onboarding.page';

import { BITCOIN_API_BASE_URL_TESTNET4 } from '@leather.io/models';
import { type RpcParams, type sendTransfer } from '@leather.io/rpc';
import { truncateMiddle } from '@leather.io/utils';

import { test } from '../../fixtures/fixtures';

const baseParams = {
  recipients: [
    {
      address: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
      amount: '800',
    },
    {
      address: TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
      amount: '900',
    },
  ],
  network: 'testnet4',
};

function clickActionButton(context: BrowserContext) {
  return async (buttonToPress: 'Cancel' | 'Approve') => {
    const popup = await context.waitForEvent('page');
    await popup.waitForTimeout(1000);
    const btn = popup.locator(`text="${buttonToPress}"`);
    await btn.click();
  };
}

async function approveAndAcceptTaprootWarning(context: BrowserContext) {
  const popup = await context.waitForEvent('page');
  await popup.waitForTimeout(1000);
  await popup.locator('text="Approve"').click();
  const continueBtn = popup.locator('text="I understand, continue"');
  await continueBtn.click({ timeout: 10000 });
}

async function mockPopupRequests(context: BrowserContext) {
  const popup = await context.waitForEvent('page');
  await mockLeatherApiRequests(popup);
  await mockTestAccountBtcBroadcastTransaction(popup);
}

async function mockPopupRequestsRecordingBroadcast(
  context: BrowserContext,
  broadcastCalls: string[]
) {
  const popup = await context.waitForEvent('page');
  await mockLeatherApiRequests(popup);
  await popup.route(`${BITCOIN_API_BASE_URL_TESTNET4}/tx`, route => {
    broadcastCalls.push(route.request().url());
    return route.fulfill({ body: 'mock-txid' });
  });
}

function openSendTransfer(page: Page) {
  return async (params: RpcParams<typeof sendTransfer>) =>
    page.evaluate(
      params =>
        (window as any).LeatherProvider?.request('sendTransfer', {
          ...params,
        }).catch((e: unknown) => e),
      { ...params }
    );
}

test.describe('RPC: sendTransfer', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('that the request can be broadcast', async ({ page, context }) => {
    void mockPopupRequests(context);

    const [result] = await Promise.all([
      openSendTransfer(page)(baseParams),
      approveAndAcceptTaprootWarning(context),
    ]);

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      result: {
        txid: '58d44000884f0ba4cdcbeb1ac082e6c802d300c16b0d3251738e8cf6a57397ce',
        transaction: test.expect.stringMatching(/^[0-9a-f]+$/),
      },
    });
  });

  test('that the signed transaction is returned without broadcasting when broadcast is false', async ({
    page,
    context,
  }) => {
    const broadcastCalls: string[] = [];
    void mockPopupRequestsRecordingBroadcast(context, broadcastCalls);

    const [result] = await Promise.all([
      openSendTransfer(page)({ ...baseParams, broadcast: false }),
      clickActionButton(context)('Approve'),
    ]);

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      result: { transaction: test.expect.stringMatching(/^[0-9a-f]+$/) },
    });
    test.expect(broadcastCalls).toHaveLength(0);
  });

  test('that the request can be cancelled', async ({ page, context }) => {
    void mockPopupRequests(context);

    const [result] = await Promise.all([
      openSendTransfer(page)(baseParams),
      clickActionButton(context)('Cancel'),
    ]);

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: 4001,
        message: 'User rejected request',
      },
    });
  });
});

test.describe('RPC: sendTransfer with an active Bitcoin multisig policy account', () => {
  const bitcoinPolicy = makeBitcoinPolicy();

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // Register on the context so the approval popup inherits the mocks before it
    // renders (the fee/coin-selection step runs eagerly and would otherwise throw
    // InsufficientFunds for the unfunded multisig address).
    await mockLeatherApiRequests(context);
    await mockFundedBitcoinAddressUtxos(context, bitcoinPolicy.address);
    await onboardingPage.signInWithTestAccount(extensionId, {
      ...policyStateOverrides({
        policies: [bitcoinPolicy],
        names: { [bitcoinPolicy.id]: 'Bitcoin vault' },
      }),
      ...getConnectedTestAppPermissionsState({ policyId: bitcoinPolicy.id }),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('shows both the multisig and the signer on the propose screen', async ({
    page,
    context,
  }) => {
    test.slow();

    // Recipient distinct from the signer's own native-segwit address so the
    // "Signing with account" caption isn't ambiguous with the recipient row.
    const resultPromise = openSendTransfer(page)({
      recipients: [{ address: TEST_ACCOUNT_2_TAPROOT_ADDRESS, amount: '1000' }],
      network: 'mainnet',
    });
    const popup = await context.waitForEvent('page');

    await test.expect(popup.getByText('Send token')).toBeVisible({ timeout: 15_000 });
    // "Transacting with account" shows the multisig.
    await test.expect(popup.getByText('Transacting with account')).toBeVisible({ timeout: 15_000 });
    await test.expect(popup.getByText('Bitcoin vault')).toBeVisible();
    await test.expect(popup.getByText(truncateMiddle(bitcoinPolicy.address, 4))).toBeVisible();
    // "Signing with account" shows the single-sig signer's Bitcoin address.
    await test.expect(popup.getByText('Signing with account')).toBeVisible();
    await test
      .expect(popup.getByText(truncateMiddle(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS, 4)))
      .toBeVisible();

    // Close the popup so the pending request resolves before teardown
    await popup.close();
    await resultPromise;
  });
});

test.describe('RPC: sendTransfer with a software wallet alongside a Ledger wallet', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // Seed the test app as connected to the software wallet. `sendTransfer`
    // requires a connected wallet, and this is the account it signs with.
    await onboardingPage.signInWithMixedSoftwareAndLedgerWallets(extensionId, {
      appPermissions: {
        ids: ['localhost:3000'],
        entities: {
          'localhost:3000': {
            origin: 'localhost:3000',
            fingerprint: testFingerprint,
            accountIndex: 0,
            requestedAccounts: '2024-01-01T00:00:00.000Z',
            networkMode: 'mainnet',
          },
        },
      },
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('that it opens the send flow without prompting to connect Ledger', async ({
    page,
    context,
  }) => {
    test.slow();

    // The transfer should open the send flow for the connected software wallet,
    // not the "Connect your Ledger" prompt, even though a Ledger wallet also
    // exists in the same keychain
    const resultPromise = openSendTransfer(page)(baseParams);
    const sendPopup = await context.waitForEvent('page');
    await mockLeatherApiRequests(sendPopup);

    await test.expect(sendPopup.getByText('Send token')).toBeVisible({ timeout: 15_000 });
    await test.expect(sendPopup.getByText('Connect & unlock your Ledger')).toHaveCount(0);

    // Close the popup so the pending request resolves before teardown
    await sendPopup.close();
    await resultPromise;
  });
});
