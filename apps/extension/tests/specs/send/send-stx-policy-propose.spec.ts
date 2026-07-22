import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import {
  mockFundedStacksAddress,
  mockProposeMultisigTransaction,
} from '@tests/mocks/mock-multisig';
import {
  exampleStacksMultisigPublicKeys,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import { deriveStxMultisigAddress } from '@leather.io/stacks';

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

test.describe('send stx from a policy (multisig) account', () => {
  test.beforeEach(
    async ({ extensionId, globalPage, homePage, onboardingPage, sendPage, context }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockProposeMultisigTransaction(context);
      await mockFundedStacksAddress(context, stacksPolicy.address);
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({
          policies: [stacksPolicy],
          activePolicyId: stacksPolicy.id,
        })
      );
      await homePage.sendButton.click();
      await sendPage.selectStxAndGoToSendForm();
    }
  );

  test('hides the edit nonce link on the form', async ({ sendPage }) => {
    await test.expect(sendPage.page.getByText('Edit nonce')).toHaveCount(0);
  });

  test('proposes the transfer to the coordinator and shows the proposal summary', async ({
    sendPage,
    page,
  }) => {
    test.slow();

    await sendPage.amountInput.fill('0.5');
    await sendPage.amountInput.blur();
    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_STX_ADDRESS);
    await sendPage.recipientInput.blur();
    await sendPage.previewSendTxButton.click();

    const confirmButton = page.getByTestId(SendCryptoAssetSelectors.ConfirmSendTxBtn);
    await test.expect(confirmButton).toHaveText('Propose transaction');

    const [proposeRequest] = await Promise.all([
      page.waitForRequest('**/v1/multisig-ext/propose'),
      confirmButton.click(),
    ]);

    const body = proposeRequest.postDataJSON();
    test.expect(body.multisigAddress).toEqual(stacksPolicy.address);
    test.expect(typeof body.rawPayload).toEqual('string');
    test.expect(typeof body.proposalSignature).toEqual('string');
    test.expect(typeof body.proposalTimestamp).toEqual('number');

    await test.expect(page.getByText('Proposal submitted')).toBeVisible({ timeout: 20_000 });
    await test.expect(page.getByText('Awaiting co-signers')).toBeVisible();
  });
});
