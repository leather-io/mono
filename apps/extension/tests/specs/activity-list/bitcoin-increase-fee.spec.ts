import { expect } from '@playwright/test';
import {
  mockBitcoinBroadcastTransaction,
  mockBitcoinPendingSendActivity,
  mockBitcoinPendingTxById,
} from '@tests/mocks/mock-btc-activity';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Bitcoin increase fee', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, homePage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockBitcoinPendingSendActivity(globalPage.page);
    await mockBitcoinPendingTxById(globalPage.page);
    await mockBitcoinBroadcastTransaction(globalPage.page);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();
  });

  test('that pending Bitcoin send shows increase fee button', async ({ page }) => {
    const increaseFeeBtn = page.getByText('Increase fee');
    await expect(increaseFeeBtn).toBeVisible();
  });

  test('that increase fee dialog opens and submits', async ({ page }) => {
    const increaseFeeBtn = page.getByText('Increase fee');
    await increaseFeeBtn.click();

    const sheetTitle = page.getByText('Increase fee').first();
    await expect(sheetTitle).toBeVisible();

    const submitBtn = page.getByTestId(ActivitySelectors.TransactionSubmitAction);
    await expect(submitBtn).toBeVisible();
  });
});
