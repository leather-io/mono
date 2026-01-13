import { createBdd } from 'playwright-bdd';

import { test } from '../fixtures/fixtures';

const { Given, When, Then } = createBdd(test);

Given('I can see my balance', async ({ homePage }) => {
  const balanceText = await homePage.page
    .getByTestId('account-card-balance-text')
    .innerText();
  test.expect(balanceText).toBeTruthy();
});

When('I toggle privacy mode', async ({ page }) => {
  await page.getByTestId('toggle-privacy').click();
});

When('I navigate to view secret key', async ({ homePage }) => {
  await homePage.goToSecretKey();
});

When('I click copy to clipboard', async ({ page }) => {
  await page.getByTestId('copy-key-to-clipboard-btn').click();
});

Then('I should see a copied confirmation message', async ({ page }) => {
  const copySuccessMessage = await page
    .getByTestId('copy-key-to-clipboard-btn')
    .innerText();
  test.expect(copySuccessMessage).toContain('Copied!');
});

Then('my balance should be hidden', async ({ homePage }) => {
  await test
    .expect(homePage.page.getByTestId('account-card-balance-text'))
    .toContainText('***');
});

When('I click on network settings', async ({ page }) => {
  await page.getByTestId('change-network-action').click();
});

Then('I should see the network selection page', async ({ page }) => {
  await page.waitForSelector('[data-testid="network-list-item"]');
});

Then('I should see mainnet as the current network', async ({ page }) => {
  const currentNetwork = await page.getByTestId('current-network').innerText();
  test.expect(currentNetwork.toLowerCase()).toContain('mainnet');
});

Then('I should see at least {int} network options', async ({ page }, count: number) => {
  const networkItems = await page.getByTestId('network-list-item').all();
  test.expect(networkItems.length).toBeGreaterThanOrEqual(count);
});

When('I select testnet', async ({ page }) => {
  await page.getByTestId('network-list-item').filter({ hasText: 'testnet' }).click();
});

Then('I should be redirected to the home page', async ({ page }) => {
  await page.waitForURL('**/home');
});

Then('I should see the testnet indicator', async ({ page }) => {
  const networkBadge = page.getByTestId('network-mode-badge');
  await test.expect(networkBadge).toContainText(/test/i);
});

When('I click add network', async ({ page }) => {
  await page.getByTestId('add-network-btn').click();
});

When('I fill in the network name {string}', async ({ page }, name: string) => {
  await page.getByTestId('network-name-input').fill(name);
});

When('I fill in the network key {string}', async ({ page }, key: string) => {
  await page.getByTestId('network-key-input').fill(key);
});

When('I fill in valid API URLs', async ({ page }) => {
  await page.getByTestId('stacks-api-url-input').fill('https://api.testnet.hiro.so');
  await page.getByTestId('bitcoin-api-url-input').fill('https://blockstream.info/testnet/api');
});

When('I click save', async ({ page }) => {
  await page.getByTestId('save-network-btn').click();
});

Then('I should see {string} in the network list', async ({ page }, networkName: string) => {
  const networkItem = page.getByTestId('network-list-item').filter({ hasText: networkName });
  await test.expect(networkItem).toBeVisible();
});
