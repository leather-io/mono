import type { BrowserContext, Page } from '@playwright/test';
import { type TokenTransferPayloadWire, deserializeTransaction } from '@stacks/transactions';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { mockEmptyStacksBalancesRequest } from '@tests/mocks/mock-stacks-balances';
import { mockEmptyStacksBalancesV2Request } from '@tests/mocks/mock-stacks-balances-v2';
import { mockStacksBroadcastTransaction } from '@tests/mocks/mock-stacks-txs';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import type { RpcParams, stxTransferStx } from '@leather.io/rpc';

import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';

import { test } from '../../fixtures/fixtures';

// Mocked fee estimations resolve to these three tiers (see mockStacksFeeRequests)
const slowFee = { displayed: '0.0002 STX', microStx: 200 };
const standardFee = { displayed: '0.0004 STX', microStx: 400 };

test.describe('RPC: stx_transferStx', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  function checkVisibleContent(context: BrowserContext, expectedMemo: string) {
    return async (buttonToPress: 'Cancel' | 'Confirm') => {
      const popup = await context.waitForEvent('page');

      await popup.waitForSelector('text="Account 1"');
      await popup.waitForSelector('text="0.0001 STX"');
      await test.expect(popup.getByText('Memo', { exact: true })).toBeVisible();
      await test.expect(popup.getByText(expectedMemo, { exact: true })).toBeVisible();
      const displayerAddress = await popup
        .getByTestId(SharedComponentsSelectors.AddressDisplayer)
        .innerText()
        .then((value: string) => value.replaceAll('\n', ''));
      test.expect(displayerAddress).toEqual('SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB');

      await popup.waitForTimeout(500);
      const btn = popup.locator('text="Confirm"');

      if (buttonToPress === 'Confirm') {
        await btn.click();
      } else {
        await popup.close();
      }
    };
  }

  function initiateSip30RpcTransferStx(page: Page) {
    return async (params: RpcParams<typeof stxTransferStx>) =>
      page.evaluate(
        params =>
          (window as any).LeatherProvider.request('stx_transferStx', {
            ...params,
          }).catch((e: unknown) => e),
        { ...params }
      );
  }

  test('shows memo on SIP-30 STX transfer approval', async ({ page, context }) => {
    const [result] = await Promise.all([
      initiateSip30RpcTransferStx(page)({
        amount: 100,
        memo: 'mock-memo',
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      checkVisibleContent(context, 'mock-memo')('Cancel'),
    ]);

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: 4001,
        message: RpcErrorMessage.UserRejectedOperation,
      },
    });
  });

  function approveAndCaptureBroadcastedTx(
    context: BrowserContext,
    { editFeeToSlow }: { editFeeToSlow: boolean }
  ) {
    return async () => {
      const popup = await context.waitForEvent('page');

      await popup.waitForSelector('text="0.0001 STX"');
      await popup.waitForSelector(`text="${standardFee.displayed}"`);
      await popup.waitForTimeout(500);

      if (editFeeToSlow) {
        await popup.getByText('Standard', { exact: true }).click();
        await popup.waitForSelector('text="Edit fee"');
        await popup.getByText('Slow', { exact: true }).click();
        await popup.locator('text="Save"').click();
        await popup.waitForSelector(`text="${slowFee.displayed}"`);
        await popup.waitForTimeout(500);
      }

      const broadcastRequestPromise = popup.waitForRequest('**/v2/transactions');
      await popup.locator('text="Approve"').click();
      const broadcastRequest = await broadcastRequestPromise;

      const requestBody = broadcastRequest.postData();
      if (!requestBody) throw new Error('Broadcast request has no body');
      return deserializeTransaction(JSON.parse(requestBody).tx);
    };
  }

  test('approves a SIP-30 STX transfer broadcasting the displayed fee', async ({
    page,
    context,
  }) => {
    const mockedTxid = await mockStacksBroadcastTransaction(context);

    const [result, broadcastedTx] = await Promise.all([
      initiateSip30RpcTransferStx(page)({
        amount: 100,
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      approveAndCaptureBroadcastedTx(context, { editFeeToSlow: false })(),
    ]);

    const payload = broadcastedTx.payload as TokenTransferPayloadWire;
    test.expect(Number(payload.amount)).toEqual(100);
    test.expect(Number(broadcastedTx.auth.spendingCondition.fee)).toEqual(standardFee.microStx);

    test.expect(result.result.txid).toEqual(mockedTxid);
    test.expect(result.result.transaction).toEqual(broadcastedTx.serialize());
  });

  test('broadcasts the fee chosen in the fee editor', async ({ page, context }) => {
    const mockedTxid = await mockStacksBroadcastTransaction(context);

    const [result, broadcastedTx] = await Promise.all([
      initiateSip30RpcTransferStx(page)({
        amount: 100,
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      approveAndCaptureBroadcastedTx(context, { editFeeToSlow: true })(),
    ]);

    const payload = broadcastedTx.payload as TokenTransferPayloadWire;
    test.expect(Number(payload.amount)).toEqual(100);
    test.expect(Number(broadcastedTx.auth.spendingCondition.fee)).toEqual(slowFee.microStx);

    test.expect(result.result.txid).toEqual(mockedTxid);
  });

  test('shows insufficient balance error and no approve action when balance is empty', async ({
    page,
    context,
  }) => {
    await mockEmptyStacksBalancesRequest(context);
    await mockEmptyStacksBalancesV2Request(context);

    const [result] = await Promise.all([
      initiateSip30RpcTransferStx(page)({
        amount: 100,
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      (async () => {
        const popup = await context.waitForEvent('page');
        await popup.waitForSelector('text="Available balance insufficient"');
        await test.expect(popup.locator('text="Approve"')).toHaveCount(0);
        await popup.close();
      })(),
    ]);

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: 4001,
        message: RpcErrorMessage.UserRejectedOperation,
      },
    });
  });

  test('shows when SIP-30 STX transfer has no memo', async ({ page, context }) => {
    const [result] = await Promise.all([
      initiateSip30RpcTransferStx(page)({
        amount: 100,
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      checkVisibleContent(context, 'No memo')('Cancel'),
    ]);

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: 4001,
        message: RpcErrorMessage.UserRejectedOperation,
      },
    });
  });
});
