import { type BrowserContext, type Page } from '@playwright/test';
import type { TestRpcResponse } from '@tests/leather-provider';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';

import { assertExistence } from '@leather.io/utils';

import { test } from '../../fixtures/fixtures';

test.describe('Message signing', () => {
  test.describe('BIP-322 message signing', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await onboardingPage.signInWithTestAccount(
        extensionId,
        getConnectedTestAppPermissionsState()
      );
      await page.goto('localhost:3000');
    });

    function clickActionButton(context: BrowserContext) {
      return async (buttonToPress: 'Cancel' | 'Sign') => {
        const popup = await context.waitForEvent('page');
        const btn = popup.getByText(buttonToPress, { exact: true });
        await btn.click();
      };
    }

    function initiateMessageSigning(page: Page) {
      return async (message: string) =>
        page.evaluate(message => {
          if (!window.LeatherProvider) throw new Error('LeatherProvider not found');
          return window.LeatherProvider.request('signMessage', {
            message,
            paymentType: 'p2wpkh',
          }).catch((e: TestRpcResponse) => e);
        }, message);
    }

    test('Signature approved', async ({ page, context }) => {
      const [result] = await Promise.all([
        initiateMessageSigning(page)('test'),
        clickActionButton(context)('Sign'),
      ]);

      assertExistence(result, 'Expected result');
      // ID is random, removed so we can test known values
      delete result.id;

      test.expect(result).toEqual({
        jsonrpc: '2.0',
        result: {
          signature:
            'AkcwRAIgBt6EMsCmR5Wy3NL1mDhviAddDFFSVK7EMNV4Z6fOfsECIGsXBBT2x8sMtBJFvjQwuf5BFMQqbFqGZzQRWy0/V2IhASEDA0e+UAqLJwegDnV2wMUnokfN3G6DY+5RFHuOQ7WQuqk=',
          address: 'bc1q530dz4h80kwlzywlhx2qn0k6vdtftd93c499yq',
          message: 'test',
        },
      });
    });

    test('Signature rejected', async ({ page, context }) => {
      const [result] = await Promise.all([
        initiateMessageSigning(page)('test'),
        clickActionButton(context)('Cancel'),
      ]);

      assertExistence(result, 'Expected result');
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
});
