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

interface AddressResponse {
  type?: string;
  kind?: string;
}

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

async function openSwitcher(context: BrowserContext) {
  const popup = await context.waitForEvent('page');
  const currentAccount = popup.getByTestId('switch-account-item-0');
  await expect(currentAccount).toBeVisible({ timeout: 10_000 });
  await currentAccount.click();
  return popup;
}

function hasPolicyAddress(addresses: AddressResponse[]) {
  return addresses.some(address => address.type === 'p2wsh' || address.kind === 'multisig');
}

function hasSinglesigAddress(addresses: AddressResponse[]) {
  return addresses.some(
    address => address.type === 'p2wpkh' || address.type === 'p2tr' || address.kind === 'single-sig'
  );
}

test.describe('Rpc: getAddresses with policy (multisig) accounts', () => {
  test.beforeEach(async ({ extensionId, globalPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
  });

  test.describe('when the enableAllowPolicyAccounts flag is on (param is enforced)', () => {
    test.beforeEach(async ({ context }) => {
      await overrideLaunchDarklyFlags(context, {
        releaseAddAccount: true,
        enableAllowPolicyAccounts: true,
      });
    });

    test('returns only the active bitcoin policy when connecting with that policy account', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({
          policies: [bitcoinPolicy, stacksPolicy],
          activePolicyId: bitcoinPolicy.id,
        })
      );
      await page.goto('localhost:3000');
      const requestPromise = initiateGetAddresses(page, { allowPolicyAccounts: true });
      await approve(context);

      const result = await requestPromise;
      expect(result.result.addresses).toEqual([
        {
          symbol: 'BTC',
          type: 'p2wsh',
          address: bitcoinPolicy.address,
          descriptor: bitcoinPolicy.descriptor,
        },
      ]);
    });

    test('returns only the active stacks policy when connecting with that policy account', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({
          policies: [bitcoinPolicy, stacksPolicy],
          activePolicyId: stacksPolicy.id,
        })
      );
      await page.goto('localhost:3000');
      const requestPromise = initiateGetAddresses(page, { allowPolicyAccounts: true });
      await approve(context);

      const result = await requestPromise;
      expect(result.result.addresses).toEqual([
        {
          symbol: 'STX',
          kind: 'multisig',
          address: stacksPolicy.address,
          threshold: stacksPolicy.threshold,
          publicKeys: stacksPolicy.publicKeys,
        },
      ]);
    });

    test('returns singlesig addresses when connecting with a singlesig account', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({ policies: [bitcoinPolicy, stacksPolicy] })
      );
      await page.goto('localhost:3000');
      const requestPromise = initiateGetAddresses(page, { allowPolicyAccounts: true });
      await approve(context);

      const result = await requestPromise;
      expect(hasPolicyAddress(result.result.addresses)).toBe(false);
      expect(hasSinglesigAddress(result.result.addresses)).toBe(true);
    });

    test('shows policy accounts as selectable in the switcher', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({ policies: [bitcoinPolicy, stacksPolicy] })
      );
      await page.goto('localhost:3000');
      void initiateGetAddresses(page, { allowPolicyAccounts: true });

      const popup = await openSwitcher(context);
      await expect(popup.getByTestId(`switch-account-policy-${bitcoinPolicy.id}`)).toBeVisible();
    });

    test('omits policy accounts and returns singlesig when the param is not set', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({ policies: [bitcoinPolicy, stacksPolicy] })
      );
      await page.goto('localhost:3000');
      const requestPromise = initiateGetAddresses(page, {});
      await approve(context);

      const result = await requestPromise;
      expect(hasPolicyAddress(result.result.addresses)).toBe(false);
      expect(hasSinglesigAddress(result.result.addresses)).toBe(true);
    });

    test('defaults to the singlesig parent when a policy is active but the param is not set', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({
          policies: [bitcoinPolicy, stacksPolicy],
          activePolicyId: bitcoinPolicy.id,
        })
      );
      await page.goto('localhost:3000');
      const requestPromise = initiateGetAddresses(page, {});
      await approve(context);

      const result = await requestPromise;
      expect(hasPolicyAddress(result.result.addresses)).toBe(false);
      expect(hasSinglesigAddress(result.result.addresses)).toBe(true);
    });

    test('does not allow selecting a policy account in the switcher when the param is not set', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({ policies: [bitcoinPolicy, stacksPolicy] })
      );
      await page.goto('localhost:3000');
      void initiateGetAddresses(page, {});

      const popup = await openSwitcher(context);
      await expect(popup.getByTestId(`switch-account-policy-${bitcoinPolicy.id}`)).toHaveCount(0);
    });
  });

  test.describe('when the enableAllowPolicyAccounts flag is off (param is ignored)', () => {
    test.beforeEach(async ({ context }) => {
      await overrideLaunchDarklyFlags(context, {
        releaseAddAccount: true,
        enableAllowPolicyAccounts: false,
      });
    });

    test('returns the active policy even when the param is not set', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({
          policies: [bitcoinPolicy, stacksPolicy],
          activePolicyId: bitcoinPolicy.id,
        })
      );
      await page.goto('localhost:3000');
      const requestPromise = initiateGetAddresses(page, {});
      await approve(context);

      const result = await requestPromise;
      expect(result.result.addresses).toEqual([
        {
          symbol: 'BTC',
          type: 'p2wsh',
          address: bitcoinPolicy.address,
          descriptor: bitcoinPolicy.descriptor,
        },
      ]);
    });

    test('shows policy accounts in the switcher even when the param is not set', async ({
      page,
      context,
      extensionId,
      onboardingPage,
    }) => {
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({ policies: [bitcoinPolicy, stacksPolicy] })
      );
      await page.goto('localhost:3000');
      void initiateGetAddresses(page, {});

      const popup = await openSwitcher(context);
      await expect(popup.getByTestId(`switch-account-policy-${bitcoinPolicy.id}`)).toBeVisible();
    });
  });
});
