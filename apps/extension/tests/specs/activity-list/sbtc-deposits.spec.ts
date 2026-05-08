import { expect } from '@playwright/test';
import { mockSbtcDepositsForActivity } from '@tests/mocks/mock-sbtc';

import { test } from '../../fixtures/fixtures';

test.describe('sBTC deposit activity', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, homePage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockSbtcDepositsForActivity(globalPage.page);
    await onboardingPage.signInWithTestAccount(extensionId);
    await homePage.clickActivityTab();
  });

  test('that pending deposit renders with correct title and status', async ({ page }) => {
    await expect(page.getByText('BTC → sBTC').first()).toBeVisible();
    await expect(page.getByText('Pending deposit')).toBeVisible();
    await expect(page.getByText('abc1…abc1')).toBeVisible();
  });

  test('that accepted deposit renders with pending mint status', async ({ page }) => {
    await expect(page.getByText('Pending mint')).toBeVisible();
    await expect(page.getByText('def4…def4')).toBeVisible();
  });
});
