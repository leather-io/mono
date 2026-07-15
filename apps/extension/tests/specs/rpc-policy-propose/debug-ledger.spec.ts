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

const stacksPolicy = makeStacksPolicy({
  address: deriveStxMultisigAddress({
    publicKeys: exampleStacksMultisigPublicKeys,
    threshold: 2,
    chainId: 1,
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

function openStxCallContract(page: Page, recipient: string) {
  return page.evaluate(
    ({ params }) =>
      void (window as any).LeatherProvider?.request('stx_callContract', params).catch(
        (e: unknown) => e
      ),
    { params: makeCallContractParams(recipient) }
  );
}

test.describe('DEBUG ledger propose', () => {
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

  test('debug cancel', async ({ page, context }) => {
    test.slow();

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      openStxCallContract(page, TEST_ACCOUNT_1_STX_ADDRESS),
    ]);
    await popup.waitForTimeout(1500);

    const proposeButton = popup.getByRole('button', { name: 'Propose transaction' });
    await test.expect(proposeButton).toBeEnabled({ timeout: 20_000 });
    await proposeButton.click();

    await test
      .expect(popup.getByText('Connect & unlock your Ledger'))
      .toBeVisible({ timeout: 20_000 });

    await popup.keyboard.press('Escape');
    await popup.waitForTimeout(3000);

    // Try clicking the header close icon if sheet still open
    const stillConnect = await popup.getByText('Connect & unlock your Ledger').isVisible();
    if (stillConnect) {
      await popup.getByRole('button', { name: 'Close' }).first().click();
    }
  });
});
