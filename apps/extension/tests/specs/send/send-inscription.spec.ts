import { expect } from '@playwright/test';
import {
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  TEST_ACCOUNT_2_TAPROOT_ADDRESS,
} from '@tests/mocks/constants';
import { mockImageInscription } from '@tests/mocks/mock-collectibles';
import { mockMainnetTestAccountInscriptionsRequests } from '@tests/mocks/mock-inscriptions-bis';
import { mockEmptyStampchainRequest } from '@tests/mocks/mock-src20';
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

      const sendButton = page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
      await sendButton.click();

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

      const sendButton = page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
      await sendButton.click();

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

test.describe('Send inscription - non-zero offset', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockEmptyStampchainRequest(globalPage.page);
    await mockMainnetTestAccountInscriptionsRequests(globalPage.page, [
      {
        ...mockInscriptionResponseNonZeroOffset,
        owner_wallet_addr: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
      },
    ]);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('should show non-zero offset inscription error', async ({ homePage, sendPage }) => {
    await homePage.clickCollectiblesTab();
    await sendPage.selectInscription();

    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
    const sendButton = sendPage.page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
    await sendButton.click();

    const errorLabel = await sendPage.formInputErrorLabel.textContent();
    test.expect(errorLabel).toContain(FormErrorMessages.NonZeroOffsetInscription);
  });
});

test.describe('Send inscription - multiple inscriptions on utxo', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockEmptyStampchainRequest(globalPage.page);
    await mockMainnetTestAccountInscriptionsRequests(globalPage.page, [
      mockImageInscription,
      {
        ...mockImageInscription,
        inscription_id: 'd2a07c26341750821da638f5da2fb00db6eacca71762e0919a14c947611c973fi0',
        inscription_number: 107315145,
      },
    ]);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('should show multiple inscription on utxo error', async ({ homePage, sendPage }) => {
    await homePage.clickCollectiblesTab();
    await sendPage.selectInscription();

    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
    const sendButton = sendPage.page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
    await sendButton.click();

    const errorLabel = await sendPage.formInputErrorLabel.textContent();
    test.expect(errorLabel).toContain(FormErrorMessages.UtxoWithMultipleInscriptions);
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
