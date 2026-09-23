import { type Page, expect } from '@playwright/test';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import {
  mockSbtcSponsorshipQuote,
  mockSbtcSponsorshipSubmit,
  sbtcSponsorshipQuoteId,
} from '@tests/mocks/mock-sbtc';
import { mockZeroStxBalanceV2Request } from '@tests/mocks/mock-stacks-balances-v2';
import { HomePage } from '@tests/page-object-models/home.page';
import { OnboardingPage } from '@tests/page-object-models/onboarding.page';
import { SendPage } from '@tests/page-object-models/send.page';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';

import { RouteUrls } from '@shared/route-urls';

import { test } from '../../fixtures/fixtures';

const sbtcTokenTestId = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc';
const amount = '0.0001';
const mediumFee = '0.000015';
const highFee = '0.00003';
const totalWithMediumFee = '0.000115';
const totalWithHighFee = '0.00013';
const unaffordableFeeSats = 50_000_000;
const sponsoredFeeRowTimeout = 15_000;
const hiroBroadcastUrl = '/v2/transactions';
const sponsorshipSubmitUrl = '/v1/sponsorship/submit';

async function openFeeSelect(page: Page) {
  await page.getByTestId(SharedComponentsSelectors.MiddleFeeEstimateItem).click();
  await page.getByTestId(SharedComponentsSelectors.FeeEstimateSelect).waitFor();
}

async function waitForSponsoredFeeRow(page: Page) {
  await expect(page.getByTestId(SharedComponentsSelectors.SponsoredFeeBadge)).toBeVisible({
    timeout: sponsoredFeeRowTimeout,
  });
}

interface SbtcSendFixtures {
  extensionId: string;
  homePage: HomePage;
  onboardingPage: OnboardingPage;
  sendPage: SendPage;
}

async function openSbtcSendForm({
  extensionId,
  homePage,
  onboardingPage,
  sendPage,
}: SbtcSendFixtures) {
  await onboardingPage.signInWithTestAccount(extensionId);
  await homePage.sendButton.click();
  await sendPage.page.waitForURL('**' + RouteUrls.SendCryptoAsset);
  await sendPage.page.getByTestId(sbtcTokenTestId).click();
  await sendPage.page.getByTestId(SendCryptoAssetSelectors.SendForm).waitFor();
  await sendPage.amountInput.fill(amount);
  await sendPage.recipientInput.fill(TEST_ACCOUNT_2_STX_ADDRESS);
  await sendPage.recipientInput.blur();
}

test.describe('Send sBTC with an STX balance that covers the fee', () => {
  test.beforeEach(async ({ extensionId, globalPage, homePage, onboardingPage, sendPage }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });
  });

  test('offers only the STX fee tiers', async ({ sendPage }) => {
    const page = sendPage.page;
    await expect(sendPage.feeToBePaid).toContainText('STX');
    await expect(page.getByTestId(SharedComponentsSelectors.SponsoredFeeBadge)).toHaveCount(0);

    await openFeeSelect(page);
    await expect(page.getByTestId(SharedComponentsSelectors.LowFeeEstimateItem)).toBeVisible();
    await expect(page.getByTestId(SharedComponentsSelectors.CustomFeeSelectItem)).toBeVisible();
  });
});

test.describe('Send sBTC without STX to cover the fee', () => {
  test.beforeEach(async ({ extensionId, globalPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockZeroStxBalanceV2Request(page);
  });

  test('offers the sBTC fee tiers with a sponsored badge', async ({
    extensionId,
    homePage,
    onboardingPage,
    sendPage,
  }) => {
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });
    const page = sendPage.page;

    await waitForSponsoredFeeRow(page);
    await expect(sendPage.feeToBePaid).toContainText(`${mediumFee} sBTC`);

    await openFeeSelect(page);
    await expect(page.getByTestId(SharedComponentsSelectors.LowFeeEstimateItem)).toBeVisible();
    await expect(page.getByTestId(SharedComponentsSelectors.HighFeeEstimateItem)).toBeVisible();
    await expect(page.getByTestId(SharedComponentsSelectors.CustomFeeSelectItem)).toHaveCount(0);

    await page.getByTestId(SharedComponentsSelectors.HighFeeEstimateItem).click();
    await expect(sendPage.feeToBePaid).toContainText(`${highFee} sBTC`);
  });

  test('submits through the sponsor with the quote of the selected tier', async ({
    extensionId,
    homePage,
    onboardingPage,
    sendPage,
  }) => {
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });
    const page = sendPage.page;
    let hiroBroadcastCalled = false;
    page.on('request', request => {
      if (request.url().includes(hiroBroadcastUrl) && request.method() === 'POST')
        hiroBroadcastCalled = true;
    });

    await waitForSponsoredFeeRow(page);
    await openFeeSelect(page);
    await page.getByTestId(SharedComponentsSelectors.HighFeeEstimateItem).click();
    await sendPage.previewSendTxButton.click();

    await expect(sendPage.feesRow).toContainText(highFee);
    await expect(
      sendPage.feesRow.getByTestId(SharedComponentsSelectors.SponsoredFeeBadge)
    ).toBeVisible();
    await expect(sendPage.confirmationDetails).toContainText(totalWithHighFee);

    const submitRequest = page.waitForRequest(
      request => request.url().includes(sponsorshipSubmitUrl) && request.method() === 'POST'
    );
    await sendPage.confirmSendTransaction();
    const body: unknown = (await submitRequest).postDataJSON();

    test.expect(body).toMatchObject({ quoteId: sbtcSponsorshipQuoteId('high') });
    test.expect(body).toHaveProperty('transaction');
    await expect(page.getByText('Sent')).toBeVisible();
    await expect(page.getByTestId(SendCryptoAssetSelectors.SentTransactionSummary)).toContainText(
      highFee
    );
    test.expect(hiroBroadcastCalled).toBe(false);
  });

  test('re-quotes and asks for a second confirmation when the quote expired', async ({
    extensionId,
    homePage,
    onboardingPage,
    sendPage,
  }) => {
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });
    const page = sendPage.page;
    await mockSbtcSponsorshipSubmit(page, [{ status: 410, code: 'quote_expired' }, {}]);

    await waitForSponsoredFeeRow(page);
    await sendPage.previewSendTxButton.click();
    await sendPage.confirmSendTransaction();

    await expect(page.getByTestId(SendCryptoAssetSelectors.SbtcFeeRequoteCallout)).toBeVisible();
    await expect(sendPage.confirmationDetails).toContainText(totalWithMediumFee);

    const submitRequest = page.waitForRequest(
      request => request.url().includes(sponsorshipSubmitUrl) && request.method() === 'POST'
    );
    await sendPage.confirmSendTransaction();
    const body: unknown = (await submitRequest).postDataJSON();

    test.expect(body).toMatchObject({ quoteId: sbtcSponsorshipQuoteId('medium') });
    await expect(page.getByText('Sent')).toBeVisible();
  });

  test('rejects the amount when the balance cannot cover amount plus the sBTC fee', async ({
    extensionId,
    homePage,
    onboardingPage,
    page,
    sendPage,
  }) => {
    await mockSbtcSponsorshipQuote(page, {
      low: unaffordableFeeSats,
      medium: unaffordableFeeSats,
      high: unaffordableFeeSats,
    });
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });

    await waitForSponsoredFeeRow(page);
    await sendPage.previewSendTxButton.click();

    await expect(sendPage.amountInputErrorLabel).toContainText('Insufficient balance');
    await expect(page.getByTestId(SendCryptoAssetSelectors.ConfirmationDetails)).toHaveCount(0);
  });
});
