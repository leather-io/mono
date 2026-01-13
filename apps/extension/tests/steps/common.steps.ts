import { createBdd } from 'playwright-bdd';

import { test } from '../fixtures/fixtures';

const { Given, When, Then } = createBdd(test);

Given('I am signed in with a test account', async ({ extensionId, globalPage, onboardingPage }) => {
  await globalPage.setupAndUseApiCalls(extensionId);
  await onboardingPage.signInWithTestAccount(extensionId);
});

Given('I am on the home page', async ({ homePage }) => {
  await homePage.page.waitForSelector('[data-testid="home-page-container"]');
});

Given('I am on testnet', async ({ homePage }) => {
  await homePage.selectTestnet();
});

Given('extensionRevamp flag is enabled', async () => {
  // Flag is enabled by default in our fixtures
  // This step is for documentation purposes
});

Given('extensionRevamp flag is disabled', async () => {
  // This would require reloading with different flag configuration
  // Handled at fixture level
});

When('I open the settings menu', async ({ page }) => {
  await page.getByTestId('settings-menu-btn').click();
});

When('I click on the support link', async ({ page }) => {
  await page.getByTestId('get-support-menu-item').click();
});

When('I click on sign out', async ({ homePage }) => {
  await homePage.signOut();
});

When('I click on lock wallet', async ({ homePage }) => {
  await homePage.lock();
});

When('I enter my password', async ({ page }) => {
  const { TEST_PASSWORD } = await import('../mocks/constants');
  await page.getByTestId('enter-password-input').fill(TEST_PASSWORD);
});

When('I click unlock', async ({ page }) => {
  await page.getByTestId('unlock-wallet-btn').click();
});

Then('I should see my account name', async ({ page }) => {
  const displayName = await page.getByTestId('current-account-display-name').innerText();
  test.expect(displayName).toEqual('Account 1');
});

Then('I should see the onboarding page', async ({ page }) => {
  await page.waitForSelector('[data-testid="sign-up-btn"]');
});

Then('I should see the sign up button', async ({ onboardingPage }) => {
  const button = onboardingPage.page.getByTestId('sign-up-btn');
  await test.expect(button).toBeVisible();
});

Then('I should see the unlock screen', async ({ page }) => {
  await page.waitForSelector('[data-testid="enter-password-input"]');
});

Then('a new tab should open with the support URL', async ({ context }) => {
  const [newPage] = await Promise.all([context.waitForEvent('page')]);
  await test.expect(newPage).toHaveURL('https://leather.io/help');
});
