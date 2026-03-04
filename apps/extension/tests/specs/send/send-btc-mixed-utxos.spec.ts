import { mockMixedUtxosForSend } from '@tests/mocks/mock-mixed-utxos';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { withNbsp } from '@tests/utils';

import { BtcFeeType } from '@leather.io/models';

import { test } from '../../fixtures/fixtures';

const recipient = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

test.describe('send btc with mixed utxos', () => {
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

  test('that send succeeds when amount requires both taproot and native segwit utxos', async ({
    sendPage,
  }) => {
    // 0.004 BTC = 400,000 sats — exceeds either the 300k taproot or 200k native
    // segwit UTXO alone. Only succeeds if coin selection combines both types.
    const amount = '0.004';

    await sendPage.amountInput.fill(amount);
    await sendPage.recipientInput.fill(recipient);
    await sendPage.recipientInput.blur();
    await sendPage.page.waitForTimeout(1000);

    await sendPage.previewSendTxButton.click();
    await sendPage.feesListItem.filter({ hasText: BtcFeeType.Low }).click();

    const confirmationAssetValue = await sendPage.confirmationDetails
      .getByTestId(SharedComponentsSelectors.InfoCardAssetValue)
      .innerText();

    test.expect(confirmationAssetValue).toEqual(withNbsp(`${amount} BTC`));
  });

  test('that send max reflects combined balance from both utxo types', async ({ sendPage }) => {
    await sendPage.recipientInput.fill(recipient);
    await sendPage.sendMaxButton.click();

    const amountValue = await sendPage.amountInput.inputValue();

    // Total UTXOs = 500,000 sats (0.005 BTC). Send max should be slightly
    // less than 0.005 due to fees, but greater than 0.003 which proves both
    // UTXO types are included. If only native segwit (200k) or only taproot
    // (300k) were used, the amount would be at most ~0.003.
    test.expect(Number(amountValue)).toBeGreaterThan(0.003);
    test.expect(Number(amountValue)).toBeLessThan(0.005);

    await sendPage.previewSendTxButton.click();
    await sendPage.feesListItem.filter({ hasText: BtcFeeType.Low }).click();

    await test.expect(sendPage.confirmationDetails).toBeVisible();
  });

  test('that fee estimation produces valid fees for mixed input types', async ({ sendPage }) => {
    // Use a smaller amount so all fee tiers have room within the 500k sats total
    await sendPage.amountInput.fill('0.003');
    await sendPage.recipientInput.fill(recipient);
    await sendPage.recipientInput.blur();
    await sendPage.page.waitForTimeout(1000);

    await sendPage.previewSendTxButton.click();

    const lowFee = sendPage.feesListItem.filter({ hasText: BtcFeeType.Low });
    await test.expect(lowFee).toBeVisible();

    const lowFeeValue = await lowFee
      .getByTestId(SharedComponentsSelectors.FeesListItemFeeValue)
      .innerText();

    test.expect(lowFeeValue).toBeTruthy();
    test.expect(lowFeeValue).not.toContain('NaN');
  });

  test('that shows insufficient funds when amount exceeds combined balance', async ({
    sendPage,
  }) => {
    // Total is 500,000 sats (0.005 BTC). Sending 0.006 BTC should fail.
    await sendPage.amountInput.fill('0.006');
    await sendPage.recipientInput.fill(recipient);
    await sendPage.previewSendTxButton.click();

    await test.expect(sendPage.amountInputErrorLabel).toContainText('Insufficient funds');
  });
});
