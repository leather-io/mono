import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { BrowserContext, Page } from '@playwright/test';
import * as btc from '@scure/btc-signer';
import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_2_TAPROOT_ADDRESS,
  TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS,
} from '@tests/mocks/constants';
import { mockTestAccountBtcBroadcastTransaction } from '@tests/mocks/mock-bitcoin-tx';
import { mockLeatherApiRequests } from '@tests/mocks/mock-leather-api';
import {
  mockMixedUtxosForSend,
  mockNativeSegwitOnlyUtxosForSend,
  mockNativeSegwitUtxo,
  mockTaprootUtxo,
} from '@tests/mocks/mock-mixed-utxos';
import { makeBitcoinPolicy, policyStateOverrides } from '@tests/mocks/mock-policies';
import { mockFundedBitcoinAddressUtxos } from '@tests/mocks/mock-utxos';
import {
  getConnectedTestAppPermissionsState,
  testFingerprint,
} from '@tests/page-object-models/onboarding.page';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

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
  return async (buttonToPress: 'Cancel' | 'Approve' | 'Sign transaction') => {
    const popup = await context.waitForEvent('page');
    await popup.waitForTimeout(1000);
    const btn = popup.getByRole('button', { name: buttonToPress });
    await btn.click();
  };
}

const noBroadcastWarningTitle = "Leather won't broadcast this transaction";

function approveAndAcceptTaprootWarning(context: BrowserContext) {
  return async (
    buttonToPress: 'Approve' | 'Sign transaction',
    beforeApprove?: (popup: Page) => Promise<void>
  ) => {
    const popup = await context.waitForEvent('page');
    await popup.waitForTimeout(1000);
    await beforeApprove?.(popup);
    await popup.getByRole('button', { name: buttonToPress }).click();
    const continueBtn = popup.locator('text="I understand, continue"');
    await continueBtn.click({ timeout: 10000 });
  };
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
      approveAndAcceptTaprootWarning(context)('Approve', async popup => {
        await test.expect(popup.getByText(noBroadcastWarningTitle)).toHaveCount(0);
      }),
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
      approveAndAcceptTaprootWarning(context)('Sign transaction', async popup => {
        await test.expect(popup.getByText(noBroadcastWarningTitle)).toBeVisible();
      }),
    ]);

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      result: { transaction: test.expect.stringMatching(/^[0-9a-f]+$/) },
    });
    test.expect(broadcastCalls).toHaveLength(0);
  });

  test('that the taproot warning gates signing when broadcast is false', async ({
    page,
    context,
  }) => {
    const broadcastCalls: string[] = [];
    void mockPopupRequestsRecordingBroadcast(context, broadcastCalls);

    const resultPromise = openSendTransfer(page)({ ...baseParams, broadcast: false });
    const popup = await context.waitForEvent('page');
    await popup.waitForTimeout(1000);
    await popup.getByRole('button', { name: 'Sign transaction' }).click();

    const warningDialog = popup.getByTestId(SendCryptoAssetSelectors.TaprootUtxoWarningDialog);
    await test.expect(warningDialog).toBeVisible({ timeout: 10000 });
    await popup.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await test.expect(warningDialog).toHaveCount(0);

    await popup.close();
    const result = await resultPromise;

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: 4001,
        message: 'User rejected request',
      },
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

const spendSourcesRecipient = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

const satsPerBtc = 100_000_000;

const mockUtxoValuesByTxid: Record<string, number> = {
  [mockNativeSegwitUtxo.txid]: Number(mockNativeSegwitUtxo.value),
  [mockTaprootUtxo.txid]: Number(mockTaprootUtxo.value),
};

async function readSpendSourceRowSats(popup: Page, testId: string) {
  const text = await popup.getByTestId(testId).innerText();
  const btcAmount = text.match(/\d+\.\d+/)?.[0];
  if (!btcAmount) throw new Error(`No BTC amount in spend source row: ${text}`);
  return Math.round(Number(btcAmount) * satsPerBtc);
}

async function readSpendSourceRows(popup: Page) {
  await test
    .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow))
    .toBeVisible({ timeout: 15_000 });
  return {
    nativeSegwit: await readSpendSourceRowSats(
      popup,
      SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow
    ),
    taproot: await readSpendSourceRowSats(popup, SendCryptoAssetSelectors.SpendSourcesTaprootRow),
  };
}

function summarizeSignedTx(hex: string) {
  const tx = btc.Transaction.fromRaw(hexToBytes(hex));
  const inputs = Array.from({ length: tx.inputsLength }, (_, index) => {
    const txid = tx.getInput(index).txid;
    if (!txid) throw new Error(`Signed tx input ${index} has no txid`);
    const value = mockUtxoValuesByTxid[bytesToHex(txid)];
    if (value === undefined)
      throw new Error(`Signed tx spends an unknown utxo ${bytesToHex(txid)}`);
    return { txid: bytesToHex(txid), value };
  });
  const outputsTotal = Array.from({ length: tx.outputsLength }, (_, index) =>
    Number(tx.getOutput(index).amount ?? 0n)
  ).reduce((sum, amount) => sum + amount, 0);
  const inputsTotal = inputs.reduce((sum, input) => sum + input.value, 0);

  return {
    fee: inputsTotal - outputsTotal,
    taprootInputTotal: inputs
      .filter(input => input.txid === mockTaprootUtxo.txid)
      .reduce((sum, input) => sum + input.value, 0),
  };
}

test.describe('RPC: sendTransfer spend sources with mixed utxos', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockLeatherApiRequests(context);
    await mockMixedUtxosForSend(context);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('that the approval shows the taproot callout and per-type rows', async ({
    page,
    context,
  }) => {
    const resultPromise = openSendTransfer(page)({
      recipients: [{ address: spendSourcesRecipient, amount: '400000' }],
      network: 'mainnet',
    });
    const popup = await context.waitForEvent('page');

    await test
      .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootCallout))
      .toBeVisible({ timeout: 15_000 });
    await test
      .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow))
      .toContainText('0.001');
    await test
      .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootRow))
      .toContainText('0.003');
    await test.expect(popup.getByText('Native SegWit + Taproot', { exact: false })).toBeVisible();

    await popup.close();
    await resultPromise;
  });

  test('that approving still shows the taproot utxo warning dialog', async ({ page, context }) => {
    const resultPromise = openSendTransfer(page)({
      recipients: [{ address: spendSourcesRecipient, amount: '400000' }],
      network: 'mainnet',
    });
    const popup = await context.waitForEvent('page');

    await test
      .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootCallout))
      .toBeVisible({ timeout: 15_000 });
    await popup.getByRole('button', { name: 'Approve' }).click();

    const warningDialog = popup.getByTestId(SendCryptoAssetSelectors.TaprootUtxoWarningDialog);
    await test.expect(warningDialog).toBeVisible({ timeout: 10000 });
    await popup.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await test.expect(warningDialog).toHaveCount(0);

    await popup.close();
    await resultPromise;
  });
});

test.describe('RPC: sendTransfer spend sources match the signed transaction', () => {
  const amount = 400_000;

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockLeatherApiRequests(context);
    await mockMixedUtxosForSend(context);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('that the displayed source totals equal the amount plus the signed fee', async ({
    page,
    context,
  }) => {
    const resultPromise = openSendTransfer(page)({
      recipients: [{ address: spendSourcesRecipient, amount: String(amount) }],
      network: 'mainnet',
      broadcast: false,
    });
    const popup = await context.waitForEvent('page');

    const rows = await readSpendSourceRows(popup);

    await popup.getByRole('button', { name: 'Sign transaction' }).click();
    await popup.locator('text="I understand, continue"').click({ timeout: 10000 });

    const result = await resultPromise;
    const signed = summarizeSignedTx(result.result.transaction);

    test.expect(signed.fee).toBeGreaterThan(0);
    test.expect(rows.nativeSegwit + rows.taproot).toEqual(amount + signed.fee);
    test.expect(rows.taproot).toEqual(signed.taprootInputTotal);
  });
});

test.describe('RPC: sendTransfer spend sources with native segwit utxos only', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockLeatherApiRequests(context);
    await mockNativeSegwitOnlyUtxosForSend(context);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('that the approval shows no callout and a zero taproot row', async ({ page, context }) => {
    const resultPromise = openSendTransfer(page)({
      recipients: [{ address: spendSourcesRecipient, amount: '100000' }],
      network: 'mainnet',
    });
    const popup = await context.waitForEvent('page');

    await test
      .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow))
      .toContainText('0.001', { timeout: 15_000 });
    await test
      .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootRow))
      .toContainText('0.00000000');
    await test
      .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootCallout))
      .toHaveCount(0);

    await popup.close();
    await resultPromise;
  });

  test('that the native segwit total equals the amount plus the signed fee', async ({
    page,
    context,
  }) => {
    const amount = 100_000;
    const resultPromise = openSendTransfer(page)({
      recipients: [{ address: spendSourcesRecipient, amount: String(amount) }],
      network: 'mainnet',
      broadcast: false,
    });
    const popup = await context.waitForEvent('page');

    const rows = await readSpendSourceRows(popup);

    await popup.getByRole('button', { name: 'Sign transaction' }).click();

    const result = await resultPromise;
    const signed = summarizeSignedTx(result.result.transaction);

    test.expect(signed.fee).toBeGreaterThan(0);
    test.expect(signed.taprootInputTotal).toEqual(0);
    test.expect(rows.taproot).toEqual(0);
    test.expect(rows.nativeSegwit).toEqual(amount + signed.fee);
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
    await test
      .expect(popup.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootRow))
      .toHaveCount(0);
    await test.expect(popup.getByText('Native SegWit + Taproot', { exact: false })).toHaveCount(0);

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
