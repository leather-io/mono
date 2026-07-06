import { BrowserContext, Page } from '@playwright/test';
import { TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS } from '@tests/mocks/constants';
import { mockTestAccountBtcBroadcastTransaction } from '@tests/mocks/mock-bitcoin-tx';
import { mockLeatherApiRequests } from '@tests/mocks/mock-leather-api';
import { makeBitcoinPolicy, policyStateOverrides } from '@tests/mocks/mock-policies';
import {
  getConnectedTestAppPermissionsState,
  testFingerprint,
} from '@tests/page-object-models/onboarding.page';

import { RpcErrorCode, type RpcParams, type sendTransfer } from '@leather.io/rpc';

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
      result: { txid: '58d44000884f0ba4cdcbeb1ac082e6c802d300c16b0d3251738e8cf6a57397ce' },
    });
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

test.describe('RPC: sendTransfer with an active multisig policy account', () => {
  const bitcoinPolicy = makeBitcoinPolicy();

  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, {
      ...policyStateOverrides({ policies: [bitcoinPolicy], activePolicyId: bitcoinPolicy.id }),
      ...getConnectedTestAppPermissionsState(),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('rejects the request without opening an approval popup', async ({ page, context }) => {
    let popupOpened = false;
    context.on('page', () => {
      popupOpened = true;
    });

    const result = await openSendTransfer(page)(baseParams);

    test.expect(result.error.code).toBe(RpcErrorCode.INVALID_REQUEST);
    test.expect(result.error.message).toContain('multisig account');
    test.expect(popupOpened).toBe(false);
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
