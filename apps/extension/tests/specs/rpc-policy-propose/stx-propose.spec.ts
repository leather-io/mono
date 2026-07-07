import { BrowserContext, Page } from '@playwright/test';
import {
  type ClarityValue,
  bufferCVFromString,
  noneCV,
  serializeCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import { TEST_ACCOUNT_1_STX_ADDRESS, TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import {
  exampleMultisigTransactionId,
  mockFundedStacksAddress,
  mockProposeMultisigTransaction,
  mockUnfundedStacksAddress,
} from '@tests/mocks/mock-multisig';
import {
  exampleStacksMultisigPublicKeys,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import {
  getConnectedTestAppPermissionsState,
  testFingerprint,
} from '@tests/page-object-models/onboarding.page';

import { deriveStxMultisigAddress } from '@leather.io/stacks';
import { truncateMiddle } from '@leather.io/utils';

import { test } from '../../fixtures/fixtures';

const mainnetChainId = 1;
// The propose flow re-derives + asserts the multisig sender, so the policy's
// address must be the real derivation of its public keys (not the shared
// fixture's static placeholder address).
const stacksPolicy = makeStacksPolicy({
  address: deriveStxMultisigAddress({
    publicKeys: exampleStacksMultisigPublicKeys,
    threshold: 2,
    chainId: mainnetChainId,
  }),
});

function makeCallContractParams(recipient: string) {
  const args: ClarityValue[] = [
    bufferCVFromString('id'), // namespace
    bufferCVFromString('test'), // name
    standardPrincipalCV(recipient), // recipient
    noneCV(), // zonefile
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
      (window as any).LeatherProvider?.request('stx_callContract', params).catch((e: unknown) => e),
    { params: makeCallContractParams(recipient) }
  );
}

function openStxCallContract(page: Page, recipient: string) {
  return page.evaluate(
    ({ params }) =>
      void (window as any).LeatherProvider?.request('stx_callContract', params).catch(
        (e: unknown) => e
      ),
    { params: makeCallContractParams(recipient) }
  );
}

async function clickPropose(context: BrowserContext) {
  const popup = await context.waitForEvent('page');
  await popup.waitForTimeout(1500);
  await popup.locator('text="Propose transaction"').click({ timeout: 20_000 });
}

test.describe('RPC: stx_callContract from a policy (multisig) account', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockProposeMultisigTransaction(context);
    await mockFundedStacksAddress(context, stacksPolicy.address);
    await onboardingPage.signInWithTestAccount(extensionId, {
      ...getConnectedTestAppPermissionsState(),
      ...policyStateOverrides({ policies: [stacksPolicy], activePolicyId: stacksPolicy.id }),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('proposes the transaction to the coordinator instead of broadcasting', async ({
    page,
    context,
  }) => {
    test.slow();

    const [result] = await Promise.all([
      requestStxCallContract(page, TEST_ACCOUNT_1_STX_ADDRESS),
      clickPropose(context),
    ]);

    delete result.id;

    test.expect(result.result).toMatchObject({
      proposalId: exampleMultisigTransactionId,
      status: 'proposed',
    });
  });

  test('proposes even when the cosigner (parent) account holds no STX', async ({
    page,
    context,
  }) => {
    test.slow();

    await mockUnfundedStacksAddress(context, TEST_ACCOUNT_1_STX_ADDRESS);

    const [result] = await Promise.all([
      requestStxCallContract(page, TEST_ACCOUNT_1_STX_ADDRESS),
      clickPropose(context),
    ]);

    delete result.id;

    test.expect(result.result).toMatchObject({
      proposalId: exampleMultisigTransactionId,
      status: 'proposed',
    });
  });

  test('blocks the proposal when the multisig has insufficient balance', async ({
    page,
    context,
  }) => {
    test.slow();

    await mockUnfundedStacksAddress(context, stacksPolicy.address);

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      openStxCallContract(page, TEST_ACCOUNT_1_STX_ADDRESS),
    ]);
    await popup.waitForTimeout(1500);

    await test
      .expect(popup.getByText('Available balance insufficient'))
      .toBeVisible({ timeout: 20_000 });
    await test.expect(popup.locator('text="Propose transaction"')).toHaveCount(0);
  });
});

test.describe('RPC: stx_callContract signer defaults to the policy owner account', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockProposeMultisigTransaction(context);
    await mockFundedStacksAddress(context, stacksPolicy.address);
    await onboardingPage.signInWithTestAccount(extensionId, {
      appPermissions: {
        ids: ['localhost:3000'],
        entities: {
          'localhost:3000': {
            origin: 'localhost:3000',
            fingerprint: testFingerprint,
            accountIndex: 1,
            requestedAccounts: '2024-01-01T00:00:00.000Z',
            networkMode: 'mainnet',
          },
        },
      },
      ...policyStateOverrides({
        policies: [stacksPolicy],
        activePolicyId: stacksPolicy.id,
        names: { [stacksPolicy.id]: 'Family vault' },
      }),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('shows the multisig and the signer, and proposes with the policy owner', async ({
    page,
    context,
  }) => {
    test.slow();

    const [result] = await Promise.all([
      requestStxCallContract(page, TEST_ACCOUNT_2_STX_ADDRESS),
      (async () => {
        const popup = await context.waitForEvent('page');
        await popup.waitForTimeout(1500);
        // "Transacting with account" shows the multisig (name + address).
        await test
          .expect(popup.getByText('Transacting with account'))
          .toBeVisible({ timeout: 20_000 });
        await test.expect(popup.getByText('Family vault')).toBeVisible();
        await test.expect(popup.getByText(truncateMiddle(stacksPolicy.address, 4))).toBeVisible();
        // "Signing with account" shows the single-sig policy owner (the signer).
        await test.expect(popup.getByText('Signing with account')).toBeVisible();
        await test
          .expect(popup.getByText(truncateMiddle(TEST_ACCOUNT_1_STX_ADDRESS, 4)))
          .toBeVisible();
        await popup.locator('text="Propose transaction"').click({ timeout: 20_000 });
      })(),
    ]);

    delete result.id;

    test.expect(result.result).toMatchObject({
      proposalId: exampleMultisigTransactionId,
      status: 'proposed',
    });
  });
});
