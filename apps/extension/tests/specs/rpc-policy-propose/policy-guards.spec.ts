import { Page } from '@playwright/test';
import { makeStacksPolicy, policyStateOverrides } from '@tests/mocks/mock-policies';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';

import { RpcErrorCode } from '@leather.io/rpc';

import { test } from '../../fixtures/fixtures';

const stacksPolicy = makeStacksPolicy();

function request(page: Page, method: string, params: unknown) {
  return page.evaluate(
    ({ method, params }) =>
      (window as any).LeatherProvider?.request(method, params).catch((e: unknown) => e),
    { method, params }
  );
}

test.describe('RPC: policy account guards', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId, {
      ...getConnectedTestAppPermissionsState(),
      ...policyStateOverrides({ policies: [stacksPolicy], activePolicyId: stacksPolicy.id }),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('rejects message signing while a multisig account is active', async ({ page }) => {
    const result = await request(page, 'stx_signMessage', { message: 'hello world' });

    test.expect(result.error.code).toBe(RpcErrorCode.INVALID_REQUEST);
    test.expect(result.error.message).toContain('multisig account');
  });

  test('rejects a Bitcoin send while a Stacks multisig account is active', async ({ page }) => {
    const result = await request(page, 'sendTransfer', {
      recipients: [{ address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', amount: '1000' }],
      network: 'mainnet',
    });

    test.expect(result.error.code).toBe(RpcErrorCode.INVALID_REQUEST);
    test.expect(result.error.message).toContain('multisig account');
  });

  test('rejects a STX transfer while a multisig account is active', async ({ page }) => {
    const result = await request(page, 'stx_transferStx', {
      recipient: 'SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173',
      amount: '1000',
    });

    test.expect(result.error.code).toBe(RpcErrorCode.INVALID_REQUEST);
    test.expect(result.error.message).toContain('multisig account');
  });
});
