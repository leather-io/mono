import type { BrowserContext, Page } from '@playwright/test';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RpcErrorCode, type RpcParams, type stxTransferStx } from '@leather.io/rpc';

import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';

import { test } from '../../fixtures/fixtures';

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

  test('rejects a request with an unknown network before opening a popup', async ({
    page,
    context,
  }) => {
    let popupOpened = false;
    context.on('page', () => {
      popupOpened = true;
    });

    const result = await page.evaluate(
      params =>
        (window as any).LeatherProvider.request('stx_transferStx', params).catch((e: unknown) => e),
      { amount: 100, recipient: TEST_ACCOUNT_2_STX_ADDRESS, network: 'mocknet' }
    );

    delete result.id;

    test.expect(result).toEqual({
      jsonrpc: '2.0',
      error: {
        code: RpcErrorCode.INVALID_PARAMS,
        message: test.expect.stringContaining("Unknown network: 'mocknet'"),
      },
    });
    test.expect(popupOpened).toBe(false);
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

test.describe('RPC: stx_transferStx network defaulting', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, {
      ...getConnectedTestAppPermissionsState(),
      networks: { ids: [], entities: {}, currentNetworkId: 'testnet' },
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('defaults to mainnet when the wallet is set to testnet and the request omits network', async ({
    page,
    context,
  }) => {
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.evaluate(
        params =>
          void (window as any).LeatherProvider.request('stx_transferStx', params).catch(
            (e: unknown) => e
          ),
        { amount: 100, recipient: TEST_ACCOUNT_2_STX_ADDRESS }
      ),
    ]);

    await popup.waitForSelector('text="Account 1"');
    await test.expect(popup.getByText('SPS8…WSFE')).toBeVisible();
    await popup.close();
  });
});
