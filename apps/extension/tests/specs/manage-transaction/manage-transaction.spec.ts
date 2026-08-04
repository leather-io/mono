import { expect } from '@playwright/test';
import { mockLeatherBitcoinTransactions } from '@tests/mocks/mock-leather-btc-txs';
import {
  mockStacksBroadcastTransaction,
  mockStacksPendingTransaction,
  mockStacksRawTx,
  mockTestAccountStacksTxsRequestsWithPendingTx,
} from '@tests/mocks/mock-stacks-txs';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { test } from '../../fixtures/fixtures';

// The same increase-fee / cancel affordances the legacy list offered, driven off
// the raw BlockchainActivity (pending + initiatedByUser) rather than the view.
test.describe('Manage transaction', () => {
  test.beforeEach(async ({ context, homePage, extensionId, globalPage, onboardingPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockLeatherBitcoinTransactions(context, []);
    await mockTestAccountStacksTxsRequestsWithPendingTx(globalPage.page);
    await mockStacksRawTx(globalPage.page);
    await mockStacksPendingTransaction(globalPage.page);
    await mockStacksBroadcastTransaction(globalPage.page);
    await onboardingPage.signInWithTestAccount(extensionId);

    await homePage.clickActivityTab();
  });

  test('that user can cancel a pending transaction', async ({ page }) => {
    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await activityList.getByTestId(ActivitySelectors.ActivityItemMenuBtn).click();
    await page.getByTestId(ActivitySelectors.ActivityItemMenuCancelTransaction).click();

    const cancelActionSheet = page.getByTestId(
      `${ActivitySelectors.TransactionActionSheet}-cancel`
    );
    await cancelActionSheet.getByTestId(ActivitySelectors.TransactionActionFeeInput).fill('0.004');
    await page.getByTestId(ActivitySelectors.TransactionSubmitAction).click();

    await expect(
      page.getByText('Transaction cancelled successfully', { exact: true })
    ).toBeVisible();
  });

  test('that user can increase the fee of a pending transaction', async ({ page }) => {
    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await activityList.getByTestId(ActivitySelectors.ActivityItemMenuBtn).click();
    await page.getByTestId(ActivitySelectors.ActivityItemMenuIncreaseFee).click();

    const increaseFeeActionSheet = page.getByTestId(
      `${ActivitySelectors.TransactionActionSheet}-increase-fee`
    );
    await increaseFeeActionSheet
      .getByTestId(ActivitySelectors.TransactionActionFeeInput)
      .fill('0.004');
    await page.getByTestId(ActivitySelectors.TransactionSubmitAction).click();

    await expect(page.getByText('Fee increased successfully', { exact: true })).toBeVisible();
  });
});
