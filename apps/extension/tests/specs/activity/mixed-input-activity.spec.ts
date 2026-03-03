import { expect } from '@playwright/test';
import { mockMixedInputBitcoinTransactions } from '@tests/mocks/mock-mixed-input-btc-tx';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Activity mixed-input Bitcoin transaction', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, homePage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockMixedInputBitcoinTransactions(globalPage.page);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();
  });

  test('shows combined outgoing balance for tx with taproot and native segwit inputs', async ({
    page,
  }) => {
    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList).toBeVisible();

    await expect(activityList.getByText('Bitcoin')).toBeVisible();

    // Net outgoing = (300,000 + 200,000) owned inputs − 99,000 change output = 401,000 sats
    // getBitcoinTxValue returns: satToBtc(99,000) - satToBtc(500,000) = "-0.00401"
    await expect(activityList.getByText('-0.00401')).toBeVisible();
  });
});
