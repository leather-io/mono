import { expect } from '@playwright/test';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { mockStacksBroadcastTransaction } from '@tests/mocks/mock-stacks-txs';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import { RouteUrls } from '@shared/route-urls';

import { test } from '../../fixtures/fixtures';

const amount = '0.000001';

test.describe('Send sip10', () => {
  test.beforeEach(async ({ extensionId, globalPage, homePage, onboardingPage, sendPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockStacksBroadcastTransaction(globalPage.page);

    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.sendButton.click();
    await sendPage.page.waitForURL('**' + RouteUrls.SendCryptoAsset);
    await sendPage.page
      .getByTestId('SP000000000000000000002Q6VF78.leather-integration-tests::leather-test-token')
      .click();
    await sendPage.page.getByTestId(SendCryptoAssetSelectors.SendForm).waitFor();
  });

  test('can send sip10 token', async ({ sendPage }) => {
    await sendPage.amountInput.fill(amount);
    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_STX_ADDRESS);
    await sendPage.recipientInput.blur();

    await sendPage.previewSendTxButton.click();
    const details = await sendPage.confirmationDetails.allInnerTexts();

    test.expect(details).toBeTruthy();

    await sendPage.confirmSendTransaction();

    await expect(sendPage.page.getByText('Sent')).toBeVisible();
  });

  test('can send sip10 token to contract principal', async ({ sendPage }) => {
    const contractPrincipal = `${TEST_ACCOUNT_2_STX_ADDRESS}.token-contract`;
    await sendPage.amountInput.fill(amount);
    await sendPage.amountInput.blur();
    await sendPage.page.waitForTimeout(2000);
    await sendPage.recipientInput.fill(contractPrincipal);
    await sendPage.recipientInput.blur();
    await sendPage.page.waitForTimeout(2000);

    await sendPage.previewSendTxButton.click();

    const recipientText = await sendPage.confirmationDetailsRecipient.locator('code').innerText();

    test.expect(recipientText).toContain('token-contract');
    test.expect(recipientText).toContain(TEST_ACCOUNT_2_STX_ADDRESS);

    const details = await sendPage.confirmationDetails.allInnerTexts();
    test.expect(details).toBeTruthy();

    const calloutText = await sendPage.page.getByText('Sending to a smart contract').innerText();
    test.expect(calloutText).toBeTruthy();

    await sendPage.confirmSendTransaction();

    await expect(sendPage.page.getByText('Sent')).toBeVisible();
  });
});
