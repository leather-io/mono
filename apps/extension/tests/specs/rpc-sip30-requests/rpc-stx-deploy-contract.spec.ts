import { type BrowserContext, type Page } from '@playwright/test';
import { ClarityVersion } from '@stacks/transactions';
import { requestLeatherProvider } from '@tests/leather-provider';
import { mockStacksTokenContract } from '@tests/mocks/mock-stacks-contract';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import type { RpcParams, stxDeployContract } from '@leather.io/rpc';

import { RpcErrorMessage } from '@shared/rpc/methods/validation.utils';

import { test } from '../../fixtures/fixtures';

test.describe('RPC: stx_deployContract', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, getConnectedTestAppPermissionsState());
    await page.goto('localhost:3000');
  });

  function checkVisibleContent(context: BrowserContext) {
    return async (buttonToPress: 'Cancel' | 'Confirm') => {
      const popup = await context.waitForEvent('page');
      await test.expect(popup.getByText('mock-contract-name', { exact: true })).toBeVisible();
      await test
        .expect(
          popup.getByText(
            'Only fees will be transferred from your account or the transaction will abort.',
            { exact: true }
          )
        )
        .toBeVisible();

      const displayerText = await popup
        .getByTestId(SharedComponentsSelectors.AddressDisplayer)
        .innerText();
      const displayerAddress = displayerText.replaceAll('\n', '');
      test.expect(displayerAddress).toEqual('SPS8CKF63P16J28AYF7PXW9E5AACH0NZNTEFWSFE');

      const btn = popup.getByText('Confirm', { exact: true });

      if (buttonToPress === 'Confirm') {
        await btn.click();
      } else {
        await popup.close();
      }
    };
  }

  function initiateSip30RpcDeployContract(page: Page) {
    return async (params: RpcParams<typeof stxDeployContract>) =>
      page.evaluate(requestLeatherProvider, {
        method: 'stx_deployContract',
        params: { ...params },
      });
  }

  test('SIP-30 deploy contract', async ({ page, context }) => {
    const [result] = await Promise.all([
      initiateSip30RpcDeployContract(page)({
        name: `mock-contract-name`,
        clarityCode: mockStacksTokenContract,
        clarityVersion: ClarityVersion.Clarity3,
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
