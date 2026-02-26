import { expect } from '@playwright/test';
import { TEST_ACCOUNT_2_TAPROOT_ADDRESS } from '@tests/mocks/constants';
import {
  mockImageInscription,
  mockMainnetInscriptionsWithData,
} from '@tests/mocks/mock-collectibles';
import { mockMainnetTestAccountEmptyUtxosRequests } from '@tests/mocks/mock-utxos';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { getDisplayerAddress } from '@tests/utils';

import { BtcFeeType } from '@leather.io/models';
import { mockInscriptionResponseNonZeroOffset } from '@leather.io/query';

import { FormErrorMessages } from '@shared/error-messages';

import { test } from '../../fixtures/fixtures';

test.describe('Send inscription', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockMainnetInscriptionsWithData(globalPage.page, [mockImageInscription]);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test.describe('valid send inscription data', () => {
    test('should show the inscription review step', async ({ homePage, sendPage }) => {
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();
      await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
      const inscriptionSendButton = sendPage.page.getByTestId(
        SendCryptoAssetSelectors.PreviewSendTxBtn
      );
      await inscriptionSendButton.click();
      await sendPage.feesListItem.filter({ hasText: BtcFeeType.Low }).click();
      const displayerAddress = await getDisplayerAddress(sendPage.confirmationDetailsRecipient);
      test.expect(displayerAddress).toEqual(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
    });
  });

  test.describe('validation errors', () => {
    test('should show the insufficient balance error', async ({
      globalPage,
      homePage,
      sendPage,
    }) => {
      await mockMainnetTestAccountEmptyUtxosRequests(globalPage.page);
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
      const inscriptionSendButton = sendPage.page.getByTestId(
        SendCryptoAssetSelectors.PreviewSendTxBtn
      );
      await inscriptionSendButton.click();

      const errorLabel = await sendPage.formInputErrorLabel.textContent();
      test.expect(errorLabel).toContain(FormErrorMessages.InsufficientFunds);
    });

    test('should show invalid address error', async ({ homePage, sendPage }) => {
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
    }) => {
      await mockMainnetInscriptionsWithData(globalPage.page, [
        mockInscriptionResponseNonZeroOffset,
      ]);
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
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
  }) => {
    await mockMainnetInscriptionsWithData(globalPage.page, [
      mockImageInscription,
      {
        ...mockImageInscription,
        inscription_id: 'd2a07c26341750821da638f5da2fb00db6eacca71762e0919a14c947611c973fi0',
        inscription_number: 107315145,
      },
    ]);
    await homePage.clickCollectiblesTab();
    await sendPage.selectInscription();

    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
    const inscriptionSendButton = sendPage.page.getByTestId(
      SendCryptoAssetSelectors.PreviewSendTxBtn
    );
    await inscriptionSendButton.click();

    const errorLabel = await sendPage.formInputErrorLabel.textContent();
    test.expect(errorLabel).toContain(FormErrorMessages.UtxoWithMultipleInscriptions);
  });

  test.describe('modal close behavior', () => {
    test('should return to collectibles tab when closing form via Escape', async ({
      homePage,
      sendPage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await expect(sendPage.recipientInput).toBeVisible();

      await page.keyboard.press('Escape');

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });

    test('should return to collectibles tab when closing form via X button', async ({
      homePage,
      sendPage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();

      await expect(sendPage.recipientInput).toBeVisible();

      const closeButton = page
        .locator('button:has(svg)')
        .filter({ has: page.locator('path') })
        .last();
      await closeButton.click();

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });

    test('should return to collectibles tab when closing fee step via Escape', async ({
      homePage,
      sendPage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();
      await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);

      const inscriptionSendButton = page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
      await inscriptionSendButton.click();

      await expect(sendPage.feesListItem.first()).toBeVisible();

      await page.keyboard.press('Escape');

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });

    test('should return to collectibles tab when closing fee step via X button', async ({
      homePage,
      sendPage,
      page,
    }) => {
      await homePage.clickCollectiblesTab();
      await sendPage.selectInscription();
      await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);

      const inscriptionSendButton = page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
      await inscriptionSendButton.click();

      await expect(sendPage.feesListItem.first()).toBeVisible();

      const closeButton = page
        .locator('button:has(svg)')
        .filter({ has: page.locator('path') })
        .last();
      await closeButton.click();

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });
  });
});
