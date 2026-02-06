import { expect } from '@playwright/test';
import { TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS } from '@tests/mocks/constants';
import { mockTestnetTestAccountInscriptionsRequests } from '@tests/mocks/mock-inscriptions-bis';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import { mockInscriptionResponse3 } from '@leather.io/query';

import { test } from '../../fixtures/fixtures';

const mockInscriptionResp = {
  ...mockInscriptionResponse3,
  owner_wallet_addr: TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS,
};

test.describe('Collectible details', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test.describe('inscription details', () => {
    test.beforeEach(async ({ globalPage }) => {
      await mockTestnetTestAccountInscriptionsRequests(globalPage.page, [mockInscriptionResp]);
    });

    test('should open inscription details when clicking collectible card', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();

      await expect(collectibleDetailsPage.container).toBeVisible();
    });

    test('should display send button for inscriptions', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();

      await expect(collectibleDetailsPage.sendButton).toBeVisible();
    });

    test('should display options menu button for inscriptions', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();

      await expect(collectibleDetailsPage.optionsButton).toBeVisible();
    });

    test('should open options menu with view original and unprotect options', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.openOptionsMenu();

      await expect(collectibleDetailsPage.viewOriginalMenuItem).toBeVisible();
      await expect(collectibleDetailsPage.unprotectMenuItem).toBeVisible();
    });

    test('should toggle protection status when clicking unprotect/protect', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.openOptionsMenu();

      await expect(collectibleDetailsPage.unprotectMenuItem).toBeVisible();

      await collectibleDetailsPage.unprotectMenuItem.click();

      await collectibleDetailsPage.openOptionsMenu();

      await expect(collectibleDetailsPage.protectMenuItem).toBeVisible();
    });

    test('should open send form when clicking send button', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
      sendPage,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.clickSend();

      await expect(sendPage.recipientInput).toBeVisible();
    });

    test('should navigate back to collectibles tab when clicking back button', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
      page,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.clickBack();

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });
  });

  test.describe('navigation flow', () => {
    test.beforeEach(async ({ globalPage }) => {
      await mockTestnetTestAccountInscriptionsRequests(globalPage.page, [mockInscriptionResp]);
    });

    test('should complete full send flow from collectible details', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
      sendPage,
      page,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.clickSend();

      await sendPage.recipientInput.fill(TEST_TESTNET_ACCOUNT_2_TAPROOT_ADDRESS);

      const previewButton = page.getByTestId(SendCryptoAssetSelectors.PreviewSendTxBtn);
      await previewButton.click();

      await expect(sendPage.feesListItem.first()).toBeVisible();
    });

    test('should preserve tab state through details and send flow', async ({
      homePage,
      networkPage,
      collectibleDetailsPage,
      page,
    }) => {
      await networkPage.selectTestnet();
      await homePage.clickCollectiblesTab();
      await collectibleDetailsPage.clickInscriptionCard();
      await collectibleDetailsPage.clickSend();

      await page.keyboard.press('Escape');

      await expect(collectibleDetailsPage.container).toBeVisible();

      await collectibleDetailsPage.clickBack();

      const collectiblesTab = page.getByTestId(HomePageSelectors.CollectiblesTabBtn);
      await expect(collectiblesTab).toHaveAttribute('data-state', 'active');
    });
  });
});
