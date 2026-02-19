import { TEST_ACCOUNT_1_TAPROOT_ADDRESS } from '@tests/mocks/constants';
import { mockMainnetTestAccountInscriptionsRequests } from '@tests/mocks/mock-inscriptions-bis';
import { mockUtxoRequestsWithInscriptions } from '@tests/mocks/mock-utxos';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';

import type { BestInSlotInscriptionResponse } from '@leather.io/query';

import { test } from '../../fixtures/fixtures';

const vout = 1;
const txid = 'a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0c';

const inscribedTaprootUtxo = {
  txid,
  vout: 1,
  value: 50000,
  height: 810200,
  address: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  path: "m/86'/0'/0'/0/0",
  keyOrigin: 'test',
};

const mockInscription: BestInSlotInscriptionResponse = {
  inscription_id: 'a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  inscription_number: 10371348,
  satpoint: `${txid}:${vout}:0`,
  owner_wallet_addr: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
  output_value: 50000,
  genesis_height: 792337,
  content_url:
    'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals/a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  bis_url:
    'https://bestinslot.xyz/ordinals/inscription/a5ab63799f0bbd2571d1b90de9ebff815f7526787e27263d2f604e22f9118d0ci0',
  genesis_ts: '2023-06-01T05:00:57.000Z',
  genesis_block_hash: '00000000000000000003fb85f8ae82f194786416cf699961b04d2953fbbd63d4',
  parent_ids: [],
  inscription_name: null,
  metadata: null,
  mime_type: 'text/plain;charset=utf-8',
  last_sale_price: null,
  slug: null,
  collection_name: null,
  render_url: null,
  bitmap_number: null,
  delegate: null,
  last_transfer_block_height: null,
};

test.describe('send btc taproot protection', () => {
  test.beforeEach(async ({ page, extensionId, globalPage, homePage, onboardingPage, sendPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);

    await mockUtxoRequestsWithInscriptions(page, [inscribedTaprootUtxo]);

    await mockMainnetTestAccountInscriptionsRequests(page, [mockInscription]);

    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.sendButton.click();
    await sendPage.selectBtcAndGoToSendForm();
    await sendPage.page
      .getByTestId(SendCryptoAssetSelectors.SendForm)
      .waitFor({ state: 'attached' });
    await sendPage.page.waitForTimeout(1000);
  });

  test('that shows insufficient funds when only taproot utxos are inscribed', async ({
    sendPage,
  }) => {
    await sendPage.amountInput.fill('0.0001');
    await sendPage.recipientInput.fill('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
    await sendPage.previewSendTxButton.click();

    const errorLabel = sendPage.amountInputErrorLabel;
    await test.expect(errorLabel).toContainText('Insufficient funds');
  });
});
