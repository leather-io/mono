import {
  mockMixedUtxosForSend,
  mockNativeSegwitOnlyUtxosForSend,
} from '@tests/mocks/mock-mixed-utxos';
import type { SendPage } from '@tests/page-object-models/send.page';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import { BtcFeeType } from '@leather.io/models';

import { test } from '../../fixtures/fixtures';

const recipient = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

async function goToReview(sendPage: SendPage, amount: string) {
  await sendPage.amountInput.fill(amount);
  await sendPage.recipientInput.fill(recipient);
  await sendPage.recipientInput.blur();
  await sendPage.page.waitForTimeout(1000);
  await sendPage.previewSendTxButton.click();
  await sendPage.feesListItem.filter({ hasText: BtcFeeType.Low }).click();
  await test.expect(sendPage.confirmationDetails).toBeVisible();
}

test.describe('send btc spend sources with mixed utxos', () => {
  test.beforeEach(async ({ page, extensionId, globalPage, homePage, onboardingPage, sendPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockMixedUtxosForSend(page);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.sendButton.click();
    await sendPage.selectBtcAndGoToSendForm();
    await sendPage.page
      .getByTestId(SendCryptoAssetSelectors.SendForm)
      .waitFor({ state: 'attached' });
    await sendPage.page.waitForTimeout(1000);
  });

  test('that the review shows the taproot callout and per-type rows', async ({ sendPage }) => {
    await goToReview(sendPage, '0.004');

    const details = sendPage.confirmationDetails;
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootCallout))
      .toBeVisible();
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow))
      .toContainText('0.002');
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootRow))
      .toContainText('0.003');
  });

  test('that confirming still shows the taproot utxo warning dialog', async ({ sendPage }) => {
    await goToReview(sendPage, '0.004');

    await sendPage.infoCardButton.click();

    const warningDialog = sendPage.page.getByTestId(
      SendCryptoAssetSelectors.TaprootUtxoWarningDialog
    );
    await test.expect(warningDialog).toBeVisible({ timeout: 10000 });
    await sendPage.page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await test.expect(warningDialog).toHaveCount(0);
  });

  test('that a taproot only spend shows the callout without rows', async ({ sendPage }) => {
    await goToReview(sendPage, '0.001');

    const details = sendPage.confirmationDetails;
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootCallout))
      .toBeVisible();
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow))
      .toHaveCount(0);
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootRow))
      .toHaveCount(0);
  });
});

test.describe('send btc spend sources with native segwit utxos only', () => {
  test.beforeEach(async ({ page, extensionId, globalPage, homePage, onboardingPage, sendPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockNativeSegwitOnlyUtxosForSend(page);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.sendButton.click();
    await sendPage.selectBtcAndGoToSendForm();
    await sendPage.page
      .getByTestId(SendCryptoAssetSelectors.SendForm)
      .waitFor({ state: 'attached' });
    await sendPage.page.waitForTimeout(1000);
  });

  test('that the review shows no callout and no rows', async ({ sendPage }) => {
    await goToReview(sendPage, '0.001');

    const details = sendPage.confirmationDetails;
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootCallout))
      .toHaveCount(0);
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesNativeSegwitRow))
      .toHaveCount(0);
    await test
      .expect(details.getByTestId(SendCryptoAssetSelectors.SpendSourcesTaprootRow))
      .toHaveCount(0);
  });
});
