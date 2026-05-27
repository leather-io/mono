import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  TEST_ACCOUNT_2_TAPROOT_ADDRESS,
} from '@tests/mocks/constants';
import { mockMixedUtxoRequests } from '@tests/mocks/mock-utxos';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import { test } from '../../fixtures/fixtures';

const taprootUtxo = {
  txid: 'aa11bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899',
  vout: 0,
  value: '100000',
  height: 810200,
  address: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  path: "m/86'/0'/0'/0/0",
};

const nativeSegwitUtxo = {
  txid: 'bb22cc33dd44ee55ff6677889900aabbccddeeff00112233445566778899aa11',
  vout: 1,
  value: '200000',
  height: 810200,
  address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  path: "m/84'/0'/0'/0/0",
};

test.describe('send btc send max with mixed utxos', () => {
  test.beforeEach(async ({ page, extensionId, globalPage, homePage, onboardingPage, sendPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockMixedUtxoRequests(page, [taprootUtxo, nativeSegwitUtxo]);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.sendButton.click();
    await sendPage.selectBtcAndGoToSendForm();
    await sendPage.page
      .getByTestId(SendCryptoAssetSelectors.SendForm)
      .waitFor({ state: 'attached' });
    await sendPage.waitForSendPageReady();
  });

  test('that send max fills correct amount using both taproot and native segwit UTXOs', async ({
    sendPage,
  }) => {
    await sendPage.recipientInput.fill('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
    await sendPage.recipientInput.blur();
    await sendPage.page.waitForTimeout(500);

    await sendPage.sendMaxButton.click();
    await sendPage.page.waitForTimeout(500);

    const amount = await sendPage.amountInput.inputValue();
    test.expect(amount).toBe('0.00299166');
  });

  test('that send max recalculates when recipient address type changes', async ({ sendPage }) => {
    await sendPage.recipientInput.fill('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
    await sendPage.recipientInput.blur();
    await sendPage.page.waitForTimeout(500);

    await sendPage.sendMaxButton.click();
    await sendPage.page.waitForTimeout(500);

    const amountWithP2wpkhRecipient = await sendPage.amountInput.inputValue();
    test.expect(amountWithP2wpkhRecipient).toBe('0.00299166');

    await sendPage.recipientInput.clear();
    await sendPage.recipientInput.fill(TEST_ACCOUNT_2_TAPROOT_ADDRESS);
    await sendPage.recipientInput.blur();
    await sendPage.page.waitForTimeout(500);

    const amountWithP2trRecipient = await sendPage.amountInput.inputValue();
    test.expect(amountWithP2trRecipient).toBe('0.00299106');

    test.expect(amountWithP2wpkhRecipient).not.toBe(amountWithP2trRecipient);
  });
});
