import { expect } from '@playwright/test';
import {
  mockTaprootOnlyBitcoinTransactions,
  mockTaprootOnlyReceiveTx,
  mockTaprootOnlySendTx,
} from '@tests/mocks/mock-taproot-only-btc-tx';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Activity taproot-only Bitcoin transaction', () => {
  test('shows correct outgoing amount for taproot-only send tx', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
    page,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockTaprootOnlyBitcoinTransactions(globalPage.page, [mockTaprootOnlySendTx]);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList).toBeVisible();

    await expect(activityList.getByText('Bitcoin')).toBeVisible();

    // Net outgoing = 0 owned outputs − 200,000 owned inputs = -200,000 sats
    // getBitcoinTxValue returns: satToBtc(0) - satToBtc(200,000) = "-0.002"
    await expect(activityList.getByText('-0.002')).toBeVisible();
  });

  test('shows correct inbound amount for taproot-only receive tx', async ({
    extensionId,
    globalPage,
    onboardingPage,
    homePage,
    page,
  }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockTaprootOnlyBitcoinTransactions(globalPage.page, [mockTaprootOnlyReceiveTx]);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList).toBeVisible();

    await expect(activityList.getByText('Bitcoin')).toBeVisible();

    // Net incoming = 150,000 owned outputs − 0 owned inputs = +150,000 sats
    // getBitcoinTxValue returns: satToBtc(150,000) - satToBtc(0) = "0.0015"
    await expect(activityList.getByText('0.0015')).toBeVisible();
  });
});
