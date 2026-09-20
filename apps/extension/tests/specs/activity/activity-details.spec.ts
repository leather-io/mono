import { expect } from '@playwright/test';
import {
  mockLeatherBitcoinTransactions,
  mockLeatherTaprootOnlySendTx,
} from '@tests/mocks/mock-leather-btc-txs';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { minusSign } from '@leather.io/utils';

import { test } from '../../fixtures/fixtures';

test.describe('Activity details', () => {
  test.beforeEach(async ({ extensionId, globalPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
  });

  test('opens a row, shows the transaction, and returns to the list', async ({
    context,
    extensionId,
    onboardingPage,
    homePage,
    page,
  }) => {
    await mockLeatherBitcoinTransactions(context, [mockLeatherTaprootOnlySendTx]);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await activityList.getByText('BTC', { exact: true }).click();

    const details = page.getByTestId(ActivitySelectors.ActivityDetails);
    await expect(details).toBeVisible();
    await expect(page.getByTestId(ActivitySelectors.ActivityDetailsTitle)).toHaveText(
      'Transaction'
    );
    await expect(details.getByText('Send BTC', { exact: true })).toBeVisible();
    await expect(details.getByText(`${minusSign} 0.00198`, { exact: true })).toBeVisible();
    await expect(page.getByTestId(ActivitySelectors.ActivityDetailsExplorer)).toBeVisible();

    await page.getByTestId(ActivitySelectors.ActivityDetailsBack).click();
    await expect(activityList).toBeVisible();
  });
});
