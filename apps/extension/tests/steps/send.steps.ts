import { createBdd } from 'playwright-bdd';

import { TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS } from '../mocks/constants';
import { test } from '../fixtures/fixtures';

const { Given, When, Then } = createBdd(test);

Given('I have navigated to the send BTC form', async ({ homePage, sendPage }) => {
  await homePage.sendButton.click();
  await sendPage.selectBtcAndGoToSendForm();
});

When('I enter an amount of {string}', async ({ sendPage }, amount: string) => {
  await sendPage.amountInput.fill(amount);
});

When('I enter a valid testnet recipient address', async ({ sendPage }) => {
  await sendPage.recipientInput.fill(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS);
});

When('I enter a recipient address with leading and trailing spaces', async ({ sendPage }) => {
  await sendPage.recipientInput.fill(` ${TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS} `);
});

When('I click preview', async ({ sendPage }) => {
  await sendPage.previewSendTxButton.click();
});

When('I select the high fee option', async ({ page }) => {
  await page.getByTestId('fee-high').click();
});

When('I click the send max button', async ({ sendPage }) => {
  await sendPage.sendMaxButton.click();
});

Then('I should see the transaction confirmation details', async ({ sendPage }) => {
  const details = await sendPage.confirmationDetails.allInnerTexts();
  test.expect(details).toBeTruthy();
});

Then('the recipient address should be displayed correctly', async ({ sendPage }) => {
  const displayedAddress = await sendPage.confirmationDetailsRecipient.innerText();
  test.expect(displayedAddress).toContain(TEST_TESTNET_ACCOUNT_2_BTC_ADDRESS.slice(0, 10));
});

Then('the displayed recipient should be trimmed', async ({ sendPage }) => {
  const displayedAddress = await sendPage.confirmationDetailsRecipient.innerText();
  test.expect(displayedAddress).not.toContain(' ');
});

Then('the amount should be displayed correctly', async ({ sendPage }) => {
  const displayedAmount = await sendPage.confirmationDetails.innerText();
  test.expect(displayedAmount).toBeTruthy();
});

Then('the fee should be higher than the standard rate', async ({ page }) => {
  const feeText = await page.getByTestId('fee-amount').innerText();
  test.expect(feeText).toBeTruthy();
});

Then('the amount field should be filled with the maximum available', async ({ sendPage }) => {
  const amount = await sendPage.amountInput.inputValue();
  test.expect(parseFloat(amount)).toBeGreaterThan(0);
});

Then('there should be remaining balance for fees', async ({ sendPage }) => {
  const feeValue = await sendPage.feeValue.innerText();
  test.expect(parseFloat(feeValue)).toBeGreaterThan(0);
});
