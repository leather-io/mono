import { expect } from '@playwright/test';
import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_TAPROOT_ADDRESS,
} from '@tests/mocks/constants';
import {
  mockBitcoinMainnetBroadcast,
  mockPendingBitcoinTransactions,
  mockPendingInboundBtcTx,
  mockPendingMixedInputBtcTx,
  mockPendingNativeSegwitBtcTx,
} from '@tests/mocks/mock-btc-txs';
import { mockMixedUtxoRequests } from '@tests/mocks/mock-utxos';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { test } from '../../fixtures/fixtures';

const noInscriptionsHtml = `
  <!doctype html><html><body>
  <dl><dt>value</dt><dd>20000</dd></dl>
  </body></html>
`;

async function mockNoInscriptions(page: import('@playwright/test').Page) {
  await page.route('**/ordinals.com/**', route =>
    route.fulfill({ status: 200, contentType: 'text/html', body: noInscriptionsHtml })
  );
}

test.describe('Bitcoin RBF increase fee', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
  });

  test('that user can increase fee on native segwit transaction', async ({ page, homePage }) => {
    await mockPendingBitcoinTransactions(page, [mockPendingNativeSegwitBtcTx]);
    await mockBitcoinMainnetBroadcast(page);
    await mockNoInscriptions(page);
    await mockMixedUtxoRequests(page, [
      {
        txid: mockPendingNativeSegwitBtcTx.vin[0].txid,
        vout: mockPendingNativeSegwitBtcTx.vin[0].vout,
        value: String(mockPendingNativeSegwitBtcTx.vin[0].prevout.value),
        height: 810200,
        address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
        path: "m/84'/0'/0'/0/0",
      },
    ]);

    await homePage.clickActivityTab();

    const increaseFeeBtn = page.getByText('Increase fee');
    await expect(increaseFeeBtn).toBeVisible();
    await increaseFeeBtn.click();

    const feeInput = page.getByTestId(ActivitySelectors.TransactionActionFeeInput);
    await feeInput.clear();
    await feeInput.fill('25');

    const submitBtn = page.getByTestId(ActivitySelectors.TransactionSubmitAction);
    await submitBtn.click();

    await expect(page.getByText('Fee increased successfully', { exact: true })).toBeVisible({
      timeout: 30000,
    });
  });

  test('that user can increase fee on mixed taproot + native segwit transaction', async ({
    page,
    homePage,
  }) => {
    await mockPendingBitcoinTransactions(page, [mockPendingMixedInputBtcTx]);
    await mockBitcoinMainnetBroadcast(page);
    await mockNoInscriptions(page);
    await mockMixedUtxoRequests(page, [
      {
        txid: mockPendingMixedInputBtcTx.vin[0].txid,
        vout: mockPendingMixedInputBtcTx.vin[0].vout,
        value: String(mockPendingMixedInputBtcTx.vin[0].prevout.value),
        height: 810200,
        address: TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
        path: "m/84'/0'/0'/0/0",
      },
      {
        txid: mockPendingMixedInputBtcTx.vin[1].txid,
        vout: mockPendingMixedInputBtcTx.vin[1].vout,
        value: String(mockPendingMixedInputBtcTx.vin[1].prevout.value),
        height: 810200,
        address: TEST_ACCOUNT_1_TAPROOT_ADDRESS,
        path: "m/86'/0'/0'/0/0",
      },
    ]);

    await homePage.clickActivityTab();

    const increaseFeeBtn = page.getByText('Increase fee');
    await expect(increaseFeeBtn).toBeVisible();
    await increaseFeeBtn.click();

    const feeInput = page.getByTestId(ActivitySelectors.TransactionActionFeeInput);

    await feeInput.clear();
    await feeInput.fill('10');

    const submitBtn = page.getByTestId(ActivitySelectors.TransactionSubmitAction);
    await submitBtn.click();

    await expect(page.getByText('Fee increased successfully', { exact: true })).toBeVisible({
      timeout: 30000,
    });
  });

  test('that increase fee button does not appear for inbound transactions', async ({
    page,
    homePage,
  }) => {
    await mockPendingBitcoinTransactions(page, [mockPendingInboundBtcTx]);

    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList).toBeVisible();
    await expect(activityList.getByText('Bitcoin')).toBeVisible();
    await expect(page.getByText('Increase fee')).not.toBeVisible();
  });
});
