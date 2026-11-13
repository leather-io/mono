import { type Page, expect } from '@playwright/test';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import { mockBnsV2NameTransferState } from '@tests/mocks/mock-stacks-bns';
import {
  MOCKED_COLLECTIBLES,
  mockTestAccountCollectibleHoldings,
} from '@tests/mocks/mock-stacks-nfts';
import { mockStacksBroadcastTransaction } from '@tests/mocks/mock-stacks-txs';
import type { SendPage } from '@tests/page-object-models/send.page';
import { CollectiblesSelectors } from '@tests/selectors/collectibles.selectors';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import { test } from '../../fixtures/fixtures';

async function sendOpenCollectible(page: Page, sendPage: SendPage, name: string) {
  await sendPage.goToCollectibleSendForm();
  await sendPage.recipientInput.fill(TEST_ACCOUNT_2_STX_ADDRESS);
  await sendPage.recipientInput.blur();
  await sendPage.previewSendTxButton.click();

  await expect(page.getByTestId(SendCryptoAssetSelectors.ConfirmationDetailsAssetValue)).toHaveText(
    name
  );
  await expect(sendPage.confirmationDetailsRecipient).toBeVisible();

  const broadcastRequest = page.waitForRequest(
    request => request.method() === 'POST' && request.url().endsWith('/v2/transactions')
  );
  await sendPage.confirmSendTransaction();
  await broadcastRequest;
}

test.describe('Send collectible', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockTestAccountCollectibleHoldings(globalPage.page);
    await mockStacksBroadcastTransaction(globalPage.page);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('can send a SIP-009 NFT from its details page', async ({ homePage, page, sendPage }) => {
    await homePage.openCollectible(MOCKED_COLLECTIBLES.sip9Nft);
    await sendOpenCollectible(page, sendPage, MOCKED_COLLECTIBLES.sip9Nft);

    await expect(page.getByText(`${MOCKED_COLLECTIBLES.sip9Nft} sent`)).toBeVisible();
  });

  test('can send a BNS v2 name from its details page', async ({ homePage, page, sendPage }) => {
    await mockBnsV2NameTransferState(page)({ isManagerTransferable: false, isListed: false });
    await homePage.openCollectible(MOCKED_COLLECTIBLES.bnsV2Name);
    await sendOpenCollectible(page, sendPage, MOCKED_COLLECTIBLES.bnsV2Name);

    await expect(page.getByText(`${MOCKED_COLLECTIBLES.bnsV2Name} sent`)).toBeVisible();
  });

  test('shows no send action for a legacy BNS name', async ({ homePage, page }) => {
    await homePage.openCollectible(MOCKED_COLLECTIBLES.legacyBnsName);

    await expect(page.getByTestId(CollectiblesSelectors.CollectibleSendBtn)).toHaveCount(0);
  });

  test('explains that a contract without a standard transfer cannot send', async ({
    homePage,
    page,
  }) => {
    await homePage.openCollectible(MOCKED_COLLECTIBLES.unsupportedNft);
    await page.getByTestId(CollectiblesSelectors.CollectibleSendBtn).click();

    await expect(
      page.getByTestId(SendCryptoAssetSelectors.SendCollectibleTransferBlocked)
    ).toContainText('SIP-009');
  });

  test('explains that a name in a managed namespace cannot be sent', async ({ homePage, page }) => {
    await mockBnsV2NameTransferState(page)({ isManagerTransferable: true, isListed: false });
    await homePage.openCollectible(MOCKED_COLLECTIBLES.bnsV2Name);
    await page.getByTestId(CollectiblesSelectors.CollectibleSendBtn).click();

    await expect(
      page.getByTestId(SendCryptoAssetSelectors.SendCollectibleTransferBlocked)
    ).toContainText('namespace manager');
  });

  test('explains that a listed name cannot be sent', async ({ homePage, page }) => {
    await mockBnsV2NameTransferState(page)({ isManagerTransferable: false, isListed: true });
    await homePage.openCollectible(MOCKED_COLLECTIBLES.bnsV2Name);
    await page.getByTestId(CollectiblesSelectors.CollectibleSendBtn).click();

    await expect(
      page.getByTestId(SendCryptoAssetSelectors.SendCollectibleTransferBlocked)
    ).toContainText('listed for sale');
  });
});
