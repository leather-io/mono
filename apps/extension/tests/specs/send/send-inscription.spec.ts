import { expect } from '@playwright/test';
import { TEST_ACCOUNT_2_TAPROOT_ADDRESS } from '@tests/mocks/constants';
import { mockImageInscription } from '@tests/mocks/mock-collectibles';
import { mockMainnetTestAccountInscriptionsRequests } from '@tests/mocks/mock-inscriptions-bis';
import { mockEmptyStampchainRequest } from '@tests/mocks/mock-src20';
import { mockMainnetTestAccountEmptyUtxosRequests } from '@tests/mocks/mock-utxos';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { getDisplayerAddress } from '@tests/utils';

import { BtcFeeType } from '@leather.io/models';

import { FormErrorMessages } from '@shared/error-messages';

import { test } from '../../fixtures/fixtures';

test.describe('Send inscription', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockEmptyStampchainRequest(globalPage.page);
    await mockMainnetTestAccountInscriptionsRequests(globalPage.page, [mockImageInscription]);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('should show inscription on collectibles tab and complete send flow', async ({
    homePage,
    sendPage,
  }) => {
    await homePage.clickCollectiblesTab();

    const inscriptionCard = sendPage.page.getByTestId('collectible-card-inscription');
    await expect(inscriptionCard.first()).toBeVisible();

    await sendPage.selectInscription();
    await expect(sendPage.recipientInput).toBeVisible();

    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
    const sendButton = sendPage.page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
    await sendButton.click();

    await sendPage.feesListItem.filter({ hasText: BtcFeeType.Low }).click();

    const displayerAddress = await getDisplayerAddress(sendPage.confirmationDetailsRecipient);
    test.expect(displayerAddress).toEqual(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
  });

  test('should show invalid address error', async ({ homePage, sendPage }) => {
    await homePage.clickCollectiblesTab();
    await sendPage.selectInscription();

    await sendPage.recipientInput.fill('123');
    const sendButton = sendPage.page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
    await sendButton.click();

    const errorMsg = await sendPage.formInputErrorLabel.textContent();
    test.expect(errorMsg).toContain(FormErrorMessages.InvalidAddress);
  });
});

test.describe('Send inscription - insufficient balance', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockEmptyStampchainRequest(globalPage.page);
    await mockMainnetTestAccountEmptyUtxosRequests(globalPage.page);
    await mockMainnetTestAccountInscriptionsRequests(globalPage.page, [mockImageInscription]);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('should show insufficient balance error', async ({ homePage, sendPage }) => {
    await homePage.clickCollectiblesTab();
    await sendPage.selectInscription();

    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
    const sendButton = sendPage.page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
    await sendButton.click();

    const errorLabel = await sendPage.formInputErrorLabel.textContent();
    test.expect(errorLabel).toContain(FormErrorMessages.InsufficientFunds);
  });
});
