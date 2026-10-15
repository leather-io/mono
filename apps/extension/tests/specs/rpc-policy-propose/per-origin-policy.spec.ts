import { type BrowserContext, type Page, expect } from '@playwright/test';
import {
  type ClarityValue,
  bufferCVFromString,
  noneCV,
  serializeCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import { type TestRpcResponse, getResponseAddresses } from '@tests/leather-provider';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import {
  exampleMultisigTransactionId,
  mockFundedStacksAddress,
  mockProposeMultisigTransaction,
} from '@tests/mocks/mock-multisig';
import {
  exampleStacksMultisigPublicKeys,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import { getConnectedTestAppPermissionsState } from '@tests/page-object-models/onboarding.page';

import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { test } from '../../fixtures/fixtures';

interface PersistedRootState {
  appPermissions?: { entities?: Record<string, { policyId?: string } | undefined> };
}

const mainnetChainId = 1;
const stacksPolicy = makeStacksPolicy({
  address: deriveStxMultisigAddress({
    publicKeys: exampleStacksMultisigPublicKeys,
    threshold: 2,
    chainId: mainnetChainId,
  }),
});

function makeCallContractParams(recipient: string) {
  const args: ClarityValue[] = [
    bufferCVFromString('id'),
    bufferCVFromString('test'),
    standardPrincipalCV(recipient),
    noneCV(),
  ];
  return {
    contract: 'SP000000000000000000002Q6VF78.bns',
    functionName: 'name-transfer',
    functionArgs: args.map(arg => serializeCV(arg)),
  };
}

function requestStxCallContract(page: Page, recipient: string) {
  return page.evaluate(
    ({ params }) =>
      window.LeatherProvider?.request('stx_callContract', params).catch((e: TestRpcResponse) => e),
    { params: makeCallContractParams(recipient) }
  );
}

function openStxCallContract(page: Page, recipient: string) {
  return page.evaluate(
    ({ params }) =>
      void window.LeatherProvider?.request('stx_callContract', params).catch(
        (e: TestRpcResponse) => e
      ),
    { params: makeCallContractParams(recipient) }
  );
}

function initiateGetAddresses(page: Page, params: unknown) {
  return page.evaluate(params => window.LeatherProvider?.request('getAddresses', params), params);
}

async function approveGetAddresses(context: BrowserContext) {
  const popup = await context.waitForEvent('page');
  const button = popup.getByTestId('get-addresses-approve-button');
  await expect(button).toBeVisible();
  await button.click();
}

async function clickPropose(context: BrowserContext) {
  const popup = await context.waitForEvent('page');
  await popup.waitForTimeout(1500);
  await popup.locator('text="Propose transaction"').click({ timeout: 20_000 });
}

function readPersistedPermission(page: Page, extensionId: string) {
  return async function readPermission() {
    await page.goto(`chrome-extension://${extensionId}/index.html`);
    const permission = await page.evaluate(async () => {
      const state = await chrome.storage.local.get<{ 'persist:root': PersistedRootState }>([
        'persist:root',
      ]);
      return state['persist:root'].appPermissions?.entities?.['localhost:3000'];
    });
    if (!permission) throw new Error('Expected persisted permission');
    return permission;
  };
}

test.describe('RPC: per-origin policy binding', () => {
  test.beforeEach(async ({ extensionId, globalPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
  });

  test('an origin connected single-sig is unaffected by the globally active policy', async ({
    page,
    context,
    extensionId,
    onboardingPage,
  }) => {
    test.slow();

    await onboardingPage.signInWithTestAccount(extensionId, {
      ...getConnectedTestAppPermissionsState(),
      ...policyStateOverrides({ policies: [stacksPolicy], activePolicyId: stacksPolicy.id }),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      openStxCallContract(page, TEST_ACCOUNT_2_STX_ADDRESS),
    ]);
    await popup.waitForTimeout(1500);

    await test
      .expect(popup.getByRole('button', { name: 'Approve' }))
      .toBeVisible({ timeout: 20_000 });
    await test.expect(popup.locator('text="Propose transaction"')).toHaveCount(0);
  });

  test('connecting with a policy persists the binding and later requests propose', async ({
    page,
    context,
    extensionId,
    onboardingPage,
  }) => {
    test.slow();

    await mockProposeMultisigTransaction(context);
    await mockFundedStacksAddress(context, stacksPolicy.address);
    await onboardingPage.signInWithTestAccount(
      extensionId,
      policyStateOverrides({ policies: [stacksPolicy], activePolicyId: stacksPolicy.id })
    );
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });

    const requestPromise = initiateGetAddresses(page, { allowPolicyAccounts: true });
    await approveGetAddresses(context);
    const connectResult = await requestPromise;
    test.expect(getResponseAddresses(connectResult)).toEqual([
      {
        symbol: 'STX',
        kind: 'multisig',
        address: stacksPolicy.address,
        threshold: stacksPolicy.threshold,
        publicKeys: stacksPolicy.publicKeys,
      },
    ]);

    const permission = await readPersistedPermission(page, extensionId)();
    test.expect(permission.policyId).toBe(stacksPolicy.id);

    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
    const [result] = await Promise.all([
      requestStxCallContract(page, TEST_ACCOUNT_2_STX_ADDRESS),
      clickPropose(context),
    ]);

    if (!result) throw new Error('Expected result');
    delete result.id;

    test.expect(result.result).toMatchObject({
      proposalId: exampleMultisigTransactionId,
      status: 'proposed',
    });
  });

  test('re-connecting single-sig clears a previously bound policy', async ({
    page,
    context,
    extensionId,
    onboardingPage,
  }) => {
    test.slow();

    await onboardingPage.signInWithTestAccount(extensionId, {
      ...getConnectedTestAppPermissionsState({ policyId: stacksPolicy.id }),
      ...policyStateOverrides({ policies: [stacksPolicy] }),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });

    const requestPromise = initiateGetAddresses(page, { allowPolicyAccounts: true });
    await approveGetAddresses(context);
    const connectResult = await requestPromise;
    test
      .expect(getResponseAddresses(connectResult).some(address => address.kind === 'single-sig'))
      .toBe(true);

    const permission = await readPersistedPermission(page, extensionId)();
    test.expect(permission.policyId).toBeUndefined();
  });
});
