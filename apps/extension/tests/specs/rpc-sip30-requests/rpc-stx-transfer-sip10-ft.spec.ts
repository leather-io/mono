import { type BrowserContext, type Page } from '@playwright/test';
import { requestLeatherProvider } from '@tests/leather-provider';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { mockEmptyStacksBalancesRequest } from '@tests/mocks/mock-stacks-balances';
import { mockEmptyStacksBalancesV2Request } from '@tests/mocks/mock-stacks-balances-v2';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import type { RpcParams, stxTransferSip10Ft } from '@leather.io/rpc';

import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';

import { test } from '../../fixtures/fixtures';

test.describe('RPC: stx_transferSip10Ft', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000');
  });

  function checkVisibleContent(context: BrowserContext) {
    return async (buttonToPress: 'Cancel' | 'Confirm') => {
      const popup = await context.waitForEvent('page');
      await test.expect(popup.getByText('LEO', { exact: true })).toBeVisible();
      await test.expect(popup.getByText('0.001', { exact: true })).toBeVisible();
      await test.expect(popup.getByText('transfer', { exact: true })).toBeVisible();
      await test
        .expect(
          popup.getByText('You will transfer exactly 0.001 LEO or the transaction will abort.', {
            exact: true,
          })
        )
        .toBeVisible();

      const displayerText = await popup
        .getByTestId(SharedComponentsSelectors.AddressDisplayer)
        .innerText();
      const displayerAddress = displayerText.replaceAll('\n', '');
      test.expect(displayerAddress).toEqual('SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6');

      const btn = popup.getByText('Confirm', { exact: true });

      if (buttonToPress === 'Confirm') {
        await btn.click();
      } else {
        await popup.close();
      }
    };
  }

  function initiateSip30RpcTransferSip10Ft(page: Page) {
    return async (params: RpcParams<typeof stxTransferSip10Ft>) =>
      page.evaluate(requestLeatherProvider, {
        method: 'stx_transferSip10Ft',
        params: { ...params },
      });
  }

  test('SIP-30 transfer sip10 fungible token', async ({ page, context }) => {
    const [result] = await Promise.all([
      initiateSip30RpcTransferSip10Ft(page)({
        amount: 1000,
        asset: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo',
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      checkVisibleContent(context)('Cancel'),
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

  const leoAssetIdentifier = 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo';
  const insufficientBalanceText = 'Available balance insufficient';

  test('does not price the token amount as STX when checking the balance', async ({
    page,
    context,
  }) => {
    async function expectApproveAndClose() {
      const popup = await context.waitForEvent('page');
      await test.expect(popup.getByText('Approve', { exact: true })).toBeVisible();
      await test.expect(popup.getByText(insufficientBalanceText, { exact: true })).toHaveCount(0);
      await popup.close();
    }

    const [result] = await Promise.all([
      initiateSip30RpcTransferSip10Ft(page)({
        amount: 100000000,
        asset: leoAssetIdentifier,
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      expectApproveAndClose(),
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

  test('shows insufficient balance error when the STX balance cannot cover the fee', async ({
    page,
    context,
  }) => {
    await mockEmptyStacksBalancesRequest(context);
    await mockEmptyStacksBalancesV2Request(context);

    async function expectInsufficientBalanceAndClose() {
      const popup = await context.waitForEvent('page');
      await test.expect(popup.getByText(insufficientBalanceText, { exact: true })).toBeVisible();
      await test.expect(popup.getByText('Approve', { exact: true })).toHaveCount(0);
      await popup.close();
    }

    const [result] = await Promise.all([
      initiateSip30RpcTransferSip10Ft(page)({
        amount: 100000000,
        asset: leoAssetIdentifier,
        recipient: TEST_ACCOUNT_2_STX_ADDRESS,
      }),
      expectInsufficientBalanceAndClose(),
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
