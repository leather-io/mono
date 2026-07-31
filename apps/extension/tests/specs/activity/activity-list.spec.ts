import { expect } from '@playwright/test';
import {
  mockLeatherBitcoinTransactions,
  mockLeatherMixedInputSendTx,
  mockLeatherTaprootOnlyReceiveTx,
  mockLeatherTaprootOnlySendTx,
  mockLeatherUnownedTx,
} from '@tests/mocks/mock-leather-btc-txs';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { minusSign } from '@leather.io/utils';

import { test } from '../../fixtures/fixtures';

test.describe('Activity list', () => {
  test.beforeEach(async ({ extensionId, globalPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
  });

  test('groups activity under a date header', async ({
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
    await expect(activityList).toBeVisible();

    // The legacy list had no grouping; the revamped list buckets by day.
    await expect(activityList.getByText('Oct 4th, 2023')).toBeVisible();
  });

  test('shows an outgoing amount for a taproot-only send', async ({
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
    await expect(activityList.getByText('Send BTC')).toBeVisible();
    await expect(activityList.getByText(`${minusSign} 0.00198`, { exact: true })).toBeVisible();
  });

  test('shows an inbound amount for a taproot-only receive', async ({
    context,
    extensionId,
    onboardingPage,
    homePage,
    page,
  }) => {
    await mockLeatherBitcoinTransactions(context, [mockLeatherTaprootOnlyReceiveTx]);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList.getByText('Receive BTC')).toBeVisible();
    await expect(activityList.getByText('+ 0.0015', { exact: true })).toBeVisible();
  });

  test('combines owned inputs across taproot and native segwit', async ({
    context,
    extensionId,
    onboardingPage,
    homePage,
    page,
  }) => {
    await mockLeatherBitcoinTransactions(context, [mockLeatherMixedInputSendTx]);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList.getByText('Send BTC')).toBeVisible();
    // Change returning to the wallet is excluded: 300,000 sats left, not 402,000.
    await expect(activityList.getByText(`${minusSign} 0.003`, { exact: true })).toBeVisible();
  });

  test('leaves out a transaction the wallet neither sent nor received', async ({
    context,
    extensionId,
    onboardingPage,
    homePage,
    page,
  }) => {
    await mockLeatherBitcoinTransactions(context, [mockLeatherUnownedTx]);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList.getByText('No activity yet')).toBeVisible();
    await expect(activityList.getByText('BTC', { exact: false })).toBeHidden();
  });

  test('renders the empty state when there is no activity', async ({
    context,
    extensionId,
    onboardingPage,
    homePage,
    page,
  }) => {
    await mockLeatherBitcoinTransactions(context, []);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();

    const activityList = page.getByTestId(ActivitySelectors.ActivityList);
    await expect(activityList.getByText('No activity yet')).toBeVisible();
  });
});
