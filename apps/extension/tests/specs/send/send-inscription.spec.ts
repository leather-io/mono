import { expect } from '@playwright/test';
import { TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS } from '@tests/mocks/constants';
import { mockTestnetTestAccountInscriptionsRequests } from '@tests/mocks/mock-inscriptions-bis';
import { mockTestnetTestAccountEmptyUtxosRequests } from '@tests/mocks/mock-utxos';
import { CollectibleDetailsSelectors } from '@tests/selectors/collectible-details.selectors';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { getDisplayerAddress } from '@tests/utils';

import { BtcFeeType } from '@leather.io/models';
import { mockInscriptionResponse3, mockInscriptionResponseNonZeroOffset } from '@leather.io/query';

import { FormErrorMessages } from '@shared/error-messages';

import { test } from '../../fixtures/fixtures';

const mockInscriptionResp = {
  ...mockInscriptionResponse3,
  owner_wallet_addr: TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS,
};

test.describe('Send inscription', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await mockTestnetTestAccountInscriptionsRequests(globalPage.page, [mockInscriptionResp]);
  });

  test.describe('valid send inscription data', () => {
    test('should show the inscription review step', async ({ homePage, sendPage, networkPage }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();
      await sendPage.recipientInput.fill(TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS);
      const inscriptionSendButton = sendPage.page.getByTestId(
        SendCryptoAssetSelectors.PreviewSendTxBtn
      );
      await inscriptionSendButton.click();
      await sendPage.feesListItem.filter({ hasText: BtcFeeType.Low }).click();
      const displayerAddress = await getDisplayerAddress(sendPage.confirmationDetailsRecipient);
      test.expect(displayerAddress).toEqual(TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS);
    });
  });

  test.describe('validation errors', () => {
    test('should show the insufficient balance error', async ({
      globalPage,
      homePage,
      sendPage,
      networkPage,
    }) => {
      await mockTestnetTestAccountEmptyUtxosRequests(globalPage.page);
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await sendPage.recipientInput.fill(TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS);
      const inscriptionSendButton = sendPage.page.getByTestId(
        SendCryptoAssetSelectors.PreviewSendTxBtn
      );
      await inscriptionSendButton.click();

      const errorLabel = await sendPage.formInputErrorLabel.textContent();
      test.expect(errorLabel).toContain(FormErrorMessages.InsufficientFunds);
    });

    test('should show invalid address error', async ({ homePage, sendPage, networkPage }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await sendPage.recipientInput.fill('123');
      const inscriptionSendButton = sendPage.page.getByTestId(
        SendCryptoAssetSelectors.PreviewSendTxBtn
      );
      await inscriptionSendButton.click();

      const errorMsg = await sendPage.formInputErrorLabel.textContent();
      test.expect(errorMsg).toContain(FormErrorMessages.InvalidAddress);
    });

    test('should show non-zero offset inscription error', async ({
      globalPage,
      homePage,
      sendPage,
      networkPage,
    }) => {
      await mockTestnetTestAccountInscriptionsRequests(globalPage.page, [
        {
          ...mockInscriptionResponseNonZeroOffset,
          owner_wallet_addr: TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS,
        },
      ]);
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await sendPage.recipientInput.fill(TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS);
      const inscriptionSendButton = sendPage.page.getByTestId(
        SendCryptoAssetSelectors.PreviewSendTxBtn
      );
      await inscriptionSendButton.click();

      const errorLabel = await sendPage.formInputErrorLabel.textContent();
      test.expect(errorLabel).toContain(FormErrorMessages.NonZeroOffsetInscription);
    });
  });

  test('should show multiple inscription on utxo error', async ({
    globalPage,
    homePage,
    sendPage,
    networkPage,
  }) => {
    await mockTestnetTestAccountInscriptionsRequests(globalPage.page, [
      mockInscriptionResp,
      mockInscriptionResp,
    ]);
    await networkPage.selectTestnet();
    await homePage.clickCollectiblesTab();
    await sendPage.selectInscription();

    await sendPage.recipientInput.fill(TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS);
    const inscriptionSendButton = sendPage.page.getByTestId(
      SendCryptoAssetSelectors.PreviewSendTxBtn
    );
    await inscriptionSendButton.click();

    const errorLabel = await sendPage.formInputErrorLabel.textContent();
    test.expect(errorLabel).toContain(FormErrorMessages.UtxoWithMultipleInscriptions);
  });

  test.describe('modal close behavior', () => {
    test('should return to details page when closing form via Escape', async ({
      homePage,
      sendPage,
      networkPage,
      page,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await expect(sendPage.recipientInput).toBeVisible();

      await page.keyboard.press('Escape');

      const detailsContainer = page.getByTestId(
        CollectibleDetailsSelectors.CollectibleDetailsContainer
      );
      await expect(detailsContainer).toBeVisible();
    });

    test('should return to collectibles tab when closing form and details', async ({
      homePage,
      sendPage,
      networkPage,
      page,
      collectibleDetailsPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await expect(sendPage.recipientInput).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(collectibleDetailsPage.container).toBeVisible();

      await collectibleDetailsPage.clickBack();

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });

    test('should return to details page when closing fee step via Escape', async ({
      homePage,
      sendPage,
      networkPage,
      page,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();
      await sendPage.recipientInput.fill(TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS);

      const inscriptionSendButton = page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
      await inscriptionSendButton.click();

      await expect(sendPage.feesListItem.first()).toBeVisible();

      await page.keyboard.press('Escape');

      const detailsContainer = page.getByTestId(
        CollectibleDetailsSelectors.CollectibleDetailsContainer
      );
      await expect(detailsContainer).toBeVisible();
    });

    test('should return to collectibles tab when closing fee step and details', async ({
      homePage,
      sendPage,
      networkPage,
      page,
      collectibleDetailsPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();
      await sendPage.recipientInput.fill(TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS);

      const inscriptionSendButton = page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
      await inscriptionSendButton.click();

      await expect(sendPage.feesListItem.first()).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(collectibleDetailsPage.container).toBeVisible();

      await collectibleDetailsPage.clickBack();

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });
  });
});
