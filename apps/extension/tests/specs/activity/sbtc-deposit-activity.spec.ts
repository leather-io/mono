import { expect } from '@playwright/test';
import {
  mockLeatherBitcoinTransactionByTxId,
  mockLeatherBitcoinTransactions,
  mockLeatherExternalDepositFundingTx,
  mockLeatherTaprootOnlySendTx,
} from '@tests/mocks/mock-leather-btc-txs';
import { createSbtcDepositFixture, mockSbtcDeposits } from '@tests/mocks/mock-sbtc';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { minusSign } from '@leather.io/utils';

import { test } from '../../fixtures/fixtures';

const sbtcDepositTitle = 'BTC → sBTC';

test.describe('sBTC deposit activity', () => {
  test.beforeEach(async ({ extensionId, globalPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
  });

  test('annotates the funding transaction of a pending deposit', async ({
    context,
    extensionId,
    onboardingPage,
    homePage,
    page,
  }) => {
    await mockLeatherBitcoinTransactions(context, [mockLeatherTaprootOnlySendTx]);
    await mockSbtcDeposits(context, {
      pending: [
        createSbtcDepositFixture({
          bitcoinTxid: mockLeatherTaprootOnlySendTx.txid,
          status: 'pending',
        }),
      ],
    });
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList.getByText(sbtcDepositTitle)).toBeVisible();
    await expect(activityList.getByText('Pending deposit')).toBeVisible();
    await expect(activityList.getByText('BTC', { exact: true })).toBeHidden();
    await expect(activityList.getByText(sbtcDepositTitle)).toHaveCount(1);
    await expect(activityList.getByText(`${minusSign} 0.00198`, { exact: true })).toBeVisible();
  });

  test('labels an accepted deposit as awaiting the mint', async ({
    context,
    extensionId,
    onboardingPage,
    homePage,
    page,
  }) => {
    await mockLeatherBitcoinTransactions(context, [mockLeatherTaprootOnlySendTx]);
    await mockSbtcDeposits(context, {
      accepted: [
        createSbtcDepositFixture({
          bitcoinTxid: mockLeatherTaprootOnlySendTx.txid,
          status: 'accepted',
        }),
      ],
    });
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList.getByText('Pending mint')).toBeVisible();
  });

  test('shows a standalone row with a reclaim link for a failed deposit funded elsewhere', async ({
    context,
    extensionId,
    onboardingPage,
    homePage,
    page,
  }) => {
    await mockLeatherBitcoinTransactions(context, [mockLeatherTaprootOnlySendTx]);
    await mockLeatherBitcoinTransactionByTxId(context, mockLeatherExternalDepositFundingTx);
    await mockSbtcDeposits(context, {
      failed: [
        createSbtcDepositFixture({
          bitcoinTxid: mockLeatherExternalDepositFundingTx.txid,
          status: 'failed',
        }),
      ],
    });
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList.getByText(sbtcDepositTitle)).toBeVisible();
    await expect(activityList.getByText('Failed')).toBeVisible();
    await expect(activityList.getByText('Reclaim')).toBeVisible();
    await expect(activityList.getByText(`${minusSign} 0.0015`, { exact: true })).toBeVisible();
    await expect(activityList.getByText('BTC', { exact: true })).toBeVisible();
  });
});
