import { expect } from '@playwright/test';
import { mockTestAccountActivityTransactions } from '@tests/mocks/mock-activity';
import {
  mockStacksBroadcastTransaction,
  mockStacksPendingTransaction,
  mockStacksRawTx,
  mockTestAccountStacksTxsRequestsWithPendingTx,
} from '@tests/mocks/mock-stacks-txs';
import { ActivitySelectors } from '@tests/selectors/activity.selectors';

import { test } from '../../fixtures/fixtures';

test.describe('Activity list rendering', () => {
  test.describe('confirmed transactions', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, homePage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockTestAccountActivityTransactions(globalPage.page);
      await onboardingPage.signInWithTestAccount(extensionId);
      await homePage.clickActivityTab();
    });

    test('that STX send renders with correct title and caption', async ({ page }) => {
      await expect(page.getByText('STX')).toBeVisible();
      await expect(page.getByText(/Sent to SP2J…9EJ7/)).toBeVisible();
    });

    test('that STX receive renders with correct title and caption', async ({ page }) => {
      await expect(page.getByText(/Received from SP2J…9EJ7/)).toBeVisible();
    });

    test('that contract call renders with function name and contract name', async ({ page }) => {
      await expect(page.getByText('swap-helper')).toBeVisible();
      await expect(page.getByText('amm-swap-pool-v1-1')).toBeVisible();
    });

    test('that smart contract deploy renders correctly', async ({ page }) => {
      await expect(page.getByText('Deployed')).toBeVisible();
      await expect(page.getByText('my-token-contract')).toBeVisible();
    });
  });

  test.describe('date headers', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, homePage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockTestAccountActivityTransactions(globalPage.page);
      await onboardingPage.signInWithTestAccount(extensionId);
      await homePage.clickActivityTab();
    });

    test('that date group headers are visible', async ({ page }) => {
      await expect(page.getByText('Today')).toBeVisible();
      await expect(page.getByText('Yesterday')).toBeVisible();
    });
  });

  test.describe('pending Stacks transaction', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, homePage }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockTestAccountStacksTxsRequestsWithPendingTx(globalPage.page);
      await mockStacksRawTx(globalPage.page);
      await mockStacksPendingTransaction(globalPage.page);
      await mockStacksBroadcastTransaction(globalPage.page);
      await onboardingPage.signInWithTestAccount(extensionId);
      await homePage.clickActivityTab();
    });

    test('that pending STX send shows sending caption', async ({ page }) => {
      await expect(page.getByText('STX')).toBeVisible();
      await expect(page.getByText(/Sending/)).toBeVisible();
    });

    test('that pending transaction shows action menu', async ({ page }) => {
      const activityList = page.getByTestId(ActivitySelectors.ActivityList);
      const menuBtn = activityList.getByTestId(ActivitySelectors.ActivityItemMenuBtn);
      await expect(menuBtn).toBeVisible();
    });

    test('that action menu has increase fee and cancel options', async ({ page }) => {
      const activityList = page.getByTestId(ActivitySelectors.ActivityList);
      const menuBtn = activityList.getByTestId(ActivitySelectors.ActivityItemMenuBtn);
      await menuBtn.click();

      const increaseFeeBtn = page.getByTestId(ActivitySelectors.ActivityItemMenuIncreaseFee);
      const cancelBtn = page.getByTestId(ActivitySelectors.ActivityItemMenuCancelTransaction);
      await expect(increaseFeeBtn).toBeVisible();
      await expect(cancelBtn).toBeVisible();
    });
  });
});
