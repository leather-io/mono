import { type BrowserContext, type Page, expect } from '@playwright/test';
import { overrideLaunchDarklyFlags } from '@tests/mocks/mock-launchdarkly';
import {
  makeBitcoinPolicy,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';

import { test } from '../../fixtures/fixtures';

const bitcoinPolicy = makeBitcoinPolicy();
const stacksPolicy = makeStacksPolicy();

async function initiateGetAddresses(page: Page, params: unknown) {
  return page.evaluate(
    params => (window as any).LeatherProvider?.request('getAddresses', params),
    params
  );
}

async function approve(context: BrowserContext) {
  const popup = await context.waitForEvent('page');
  const button = popup.getByTestId('get-addresses-approve-button');
  await expect(button).toBeVisible();
  await button.click();
}

test.describe('Rpc: getAddresses with policy (multisig) accounts', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // Policy inclusion is gated behind `releaseAddAccount`
    await overrideLaunchDarklyFlags(context, { releaseAddAccount: true });
    await onboardingPage.signInWithTestAccount(
      extensionId,
      policyStateOverrides({ policies: [bitcoinPolicy, stacksPolicy] })
    );
  });

  test('includes registered multisig accounts when allowPolicyAccounts is set', async ({
    page,
    context,
  }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateGetAddresses(page, { allowPolicyAccounts: true });
    await approve(context);

    const result = await requestPromise;
    expect(result.result.addresses).toEqual(
      expect.arrayContaining([
        {
          symbol: 'BTC',
          type: 'p2wsh',
          address: bitcoinPolicy.address,
          descriptor: bitcoinPolicy.descriptor,
        },
        {
          symbol: 'STX',
          kind: 'multisig',
          address: stacksPolicy.address,
          threshold: stacksPolicy.threshold,
          publicKeys: stacksPolicy.publicKeys,
        },
      ])
    );
  });

  test('omits multisig accounts when allowPolicyAccounts is not set', async ({ page, context }) => {
    await page.goto('localhost:3000');
    const requestPromise = initiateGetAddresses(page, {});
    await approve(context);

    const result = await requestPromise;
    const hasPolicyAddress = result.result.addresses.some(
      (address: { type?: string; kind?: string }) =>
        address.type === 'p2wsh' || address.kind === 'multisig'
    );
    expect(hasPolicyAddress).toBe(false);
  });
});
