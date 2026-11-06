import { type BrowserContext, type Page } from '@playwright/test';
import { requestLeatherProvider } from '@tests/leather-provider';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import { PostConditionSelectors } from '@tests/selectors/requests.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import type { RpcParams, stxTransferSip9Nft } from '@leather.io/rpc';

import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';

import { test } from '../../fixtures/fixtures';

test.describe('RPC: stx_transferSip9Nft', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000');
  });

  function checkVisibleContent(context: BrowserContext) {
    return async (buttonToPress: 'Cancel' | 'Confirm') => {
      const popup = await context.waitForEvent('page');
      const postConditionItem = popup.getByTestId(PostConditionSelectors.PostConditionItem);
      await test.expect(popup.getByText('LIV', { exact: true })).toBeVisible();
      await test.expect(popup.getByText('You will transfer', { exact: true })).toBeVisible();
      await test
        .expect(postConditionItem.getByText('living-leather', { exact: true }))
        .toBeVisible();
      await test.expect(postConditionItem.getByText('SPS8…WSFE', { exact: true })).toBeVisible();
      await test
        .expect(
          popup.getByText('You will transfer LIV or the transaction will abort.', { exact: true })
        )
        .toBeVisible();

      const displayerText = await popup
        .getByTestId(SharedComponentsSelectors.AddressDisplayer)
        .innerText();
      const displayerAddress = displayerText.replaceAll('\n', '');
      test.expect(displayerAddress).toEqual('SP2XMGYYTA1KRBKBYJHTW8CFWB2QYZKZE4BMHG3PJ');

      const btn = popup.getByText('Confirm', { exact: true });

      if (buttonToPress === 'Confirm') {
        await btn.click();
      } else {
        await popup.close();
      }
    };
  }

  function initiateSip30RpcTransferSip9Nft(page: Page) {
    return async (params: RpcParams<typeof stxTransferSip9Nft>) =>
      page.evaluate(requestLeatherProvider, {
        method: 'stx_transferSip9Nft',
        params: { ...params },
      });
  }

  test('SIP-30 transfer sip9 non-fungible token', async ({ page, context }) => {
    const [result] = await Promise.all([
      initiateSip30RpcTransferSip9Nft(page)({
        assetId: '0100000000000000000000000000000287', // serializeCV(uintCV(647))
        asset: 'SP2XMGYYTA1KRBKBYJHTW8CFWB2QYZKZE4BMHG3PJ.living-leather::living-leather',
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
});
