import { expect } from '@playwright/test';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { mockStacksBroadcastTransaction } from '@tests/mocks/mock-stacks-txs';

import { test } from '../../fixtures/fixtures';

const amount = '0.000001';
const leatherTestTokenTestId =
  'SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token';

test.describe('Send sip10', () => {
  test.beforeEach(async ({ extensionId, globalPage, homePage, onboardingPage, sendPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockStacksBroadcastTransaction(globalPage.page);

    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.sendButton.click();
    await sendPage.selectSip10AndGoToSendForm(leatherTestTokenTestId);
  });

  test('can send sip10 token', async ({ sendPage }) => {
    await sendPage.amountInput.fill(amount);
    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_STX_ADDRESS);
    await sendPage.recipientInput.blur();

    await sendPage.previewSendTxButton.click();
    await test.expect(sendPage.confirmationDetails).toBeVisible();

    await sendPage.confirmSendTransaction();

    await expect(sendPage.page.getByText('Sent')).toBeVisible();
  });

  test('can send sip10 token to contract principal', async ({ sendPage }) => {
    const contractPrincipal = `${TEST_ACCOUNT_2_STX_ADDRESS}.token-contract`;
    await sendPage.amountInput.fill(amount);
    await sendPage.amountInput.blur();
    await sendPage.recipientInput.fill(contractPrincipal);
    await sendPage.recipientInput.blur();

    await sendPage.previewSendTxButton.click();

    const recipientText = await sendPage.confirmationDetailsRecipient.getByRole('code').innerText();

    test.expect(recipientText).toContain('token-contract');
    test.expect(recipientText).toContain(TEST_ACCOUNT_2_STX_ADDRESS);

    await test.expect(sendPage.confirmationDetails).toBeVisible();

    const calloutText = sendPage.page.getByText('Sending to a smart contract');
    await test.expect(calloutText).toBeVisible();

    await sendPage.confirmSendTransaction();

    await expect(sendPage.page.getByText('Sent')).toBeVisible();
  });
});
