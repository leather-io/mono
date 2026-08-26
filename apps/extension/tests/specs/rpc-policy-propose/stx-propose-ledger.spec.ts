import { Page } from '@playwright/test';
import {
  type ClarityValue,
  bufferCVFromString,
  noneCV,
  serializeCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import { TEST_ACCOUNT_1_STX_ADDRESS } from '@tests/mocks/constants';
import { mockFundedStacksAddress } from '@tests/mocks/mock-multisig';
import {
  exampleStacksMultisigPublicKeys,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import {
  getConnectedTestAppPermissionsState,
  makeLedgerTestAccountWalletState,
} from '@tests/page-object-models/onboarding.page';

import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { test } from '../../fixtures/fixtures';

const mainnetChainId = 1;
// The propose flow re-derives + asserts the multisig sender, so the policy's
// address must be the real derivation of its public keys. The Ledger fixture
// shares the software test account's keys (same fingerprint `e87a850b`), so the
// shared policy mocks apply as-is.
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

function openStxCallContract(page: Page, recipient: string) {
  return page.evaluate(
    ({ params }) =>
      void (window as any).LeatherProvider?.request('stx_callContract', params).catch(
        (e: unknown) => e
      ),
    { params: makeCallContractParams(recipient) }
  );
}

test.describe('RPC: stx_callContract propose from a Ledger policy account', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page, context }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockFundedStacksAddress(context, stacksPolicy.address);
    await onboardingPage.signInWithLedgerAccount(extensionId, {
      ...makeLedgerTestAccountWalletState(['stacks']),
      ...getConnectedTestAppPermissionsState({ policyId: stacksPolicy.id }),
      ...policyStateOverrides({ policies: [stacksPolicy] }),
    });
    await page.goto('localhost:3000', { waitUntil: 'networkidle' });
  });

  test('propose opens the ledger signing flow and cancelling returns to the approver', async ({
    page,
    context,
  }) => {
    test.slow();

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      openStxCallContract(page, TEST_ACCOUNT_1_STX_ADDRESS),
    ]);
    await popup.waitForTimeout(1500);

    // The approve action must not be gated for Ledger wallets
    const proposeButton = popup.getByRole('button', { name: 'Propose transaction' });
    await test.expect(proposeButton).toBeEnabled({ timeout: 20_000 });
    await proposeButton.click();

    // The SIP-018 commitment signing routes into the ledger message flow
    await test
      .expect(popup.getByText('Connect & unlock your Ledger'))
      .toBeVisible({ timeout: 20_000 });

    // Closing the sheet settles the pending signing promise as a cancellation
    await popup.keyboard.press('Escape');
    await test
      .expect(popup.getByText('Unable to propose transaction'))
      .toBeVisible({ timeout: 20_000 });
    await test.expect(popup.getByText('user cancelled the signing operation')).toBeVisible();

    // Dismissing the error returns to the approver, ready to retry
    await popup.getByRole('button', { name: 'Close' }).last().click();
    await test
      .expect(popup.getByRole('button', { name: 'Propose transaction' }))
      .toBeVisible({ timeout: 20_000 });
  });
});
