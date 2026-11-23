import { type Page, expect } from '@playwright/test';
import { TEST_ACCOUNT_2_STX_ADDRESS } from '@tests/mocks/constants';
import {
  SBTC_SPONSORSHIP_QUOTE_ID,
  mockSbtcSponsorshipQuote,
  mockSbtcSponsorshipSubmit,
} from '@tests/mocks/mock-sbtc';
import { mockZeroStxPrincipalBalanceRequest } from '@tests/mocks/mock-stacks-principal-balances';
import type { HomePage } from '@tests/page-object-models/home.page';
import type { OnboardingPage } from '@tests/page-object-models/onboarding.page';
import type { SendPage } from '@tests/page-object-models/send.page';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { expectToSettleAt } from '@tests/utils';

import { test } from '../../fixtures/fixtures';

const sbtcTokenTestId = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc';
const amount = '0.0001';
const mediumFee = '0.00001402';
const highFee = '0.00008002';
const totalWithMediumFee = '0.00011402';
const totalWithHighFee = '0.00018002';
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
  await sendPage.selectSip10AndGoToSendForm(sbtcTokenTestId);
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
    await mockZeroStxPrincipalBalanceRequest(page);
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

  test('submits through the sponsor with the fee of the selected tier', async ({
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

    test.expect(body).toMatchObject({ quoteId: SBTC_SPONSORSHIP_QUOTE_ID });
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

    test.expect(body).toMatchObject({ quoteId: SBTC_SPONSORSHIP_QUOTE_ID });
    await expect(page.getByText('Sent')).toBeVisible();
  });

  test('resubmits the same transaction while the fee payer funding is pending', async ({
    extensionId,
    homePage,
    onboardingPage,
    sendPage,
  }) => {
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });
    const page = sendPage.page;
    await mockSbtcSponsorshipSubmit(page, [{ status: 503, code: 'funding_pending' }, {}]);
    const submittedTransactions: unknown[] = [];
    page.on('request', request => {
      if (request.url().includes(sponsorshipSubmitUrl) && request.method() === 'POST')
        submittedTransactions.push(request.postDataJSON());
    });

    await waitForSponsoredFeeRow(page);
    await sendPage.previewSendTxButton.click();
    await sendPage.confirmSendTransaction();

    await expect(page.getByText('Sent')).toBeVisible({ timeout: sponsoredFeeRowTimeout });
    test.expect(submittedTransactions).toHaveLength(2);
    test.expect(submittedTransactions[1]).toEqual(submittedTransactions[0]);
  });

  test('keeps confirm disabled while waiting to resubmit', async ({
    extensionId,
    homePage,
    onboardingPage,
    sendPage,
  }) => {
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });
    const page = sendPage.page;
    await mockSbtcSponsorshipSubmit(page, [{ status: 503, code: 'funding_pending' }, {}]);
    const confirmButton = page.getByTestId(SendCryptoAssetSelectors.ConfirmSendTxBtn);

    await waitForSponsoredFeeRow(page);
    await sendPage.previewSendTxButton.click();
    const fundingPendingResponse = page.waitForResponse(
      response => response.url().includes(sponsorshipSubmitUrl) && response.status() === 503
    );
    await sendPage.confirmSendTransaction();
    await fundingPendingResponse;

    await expectToSettleAt(() => confirmButton.isDisabled(), true);
    await expect(page.getByText('Sent')).toBeVisible({ timeout: sponsoredFeeRowTimeout });
  });

  test('reports an unknown status when the sponsor connection drops', async ({
    extensionId,
    homePage,
    onboardingPage,
    sendPage,
  }) => {
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });
    const page = sendPage.page;
    await mockSbtcSponsorshipSubmit(page, [{ networkFailure: true }]);

    await waitForSponsoredFeeRow(page);
    await sendPage.previewSendTxButton.click();
    await sendPage.confirmSendTransaction();

    await expect(page.getByText('Transaction status unknown', { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        'Your transaction may have been sent. Check your activity before trying again.',
        { exact: true }
      )
    ).toBeVisible();
    await expect(page.getByText('Unable to broadcast transaction', { exact: true })).toHaveCount(0);

    await page.getByTestId(SharedComponentsSelectors.BroadcastErrorSheetCloseBtn).click();
    await homePage.waitForHomePageReady();
    await expect(page.getByTestId(SendCryptoAssetSelectors.ConfirmationDetails)).toHaveCount(0);
  });

  test('reports a failed broadcast when the sponsor rejects the transfer', async ({
    extensionId,
    homePage,
    onboardingPage,
    sendPage,
  }) => {
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });
    const page = sendPage.page;
    await mockSbtcSponsorshipSubmit(page, [
      { status: 422, code: 'not_eligible', reason: 'insufficient_sbtc' },
    ]);

    await waitForSponsoredFeeRow(page);
    await sendPage.previewSendTxButton.click();
    await sendPage.confirmSendTransaction();

    await expect(page.getByText('Unable to broadcast transaction', { exact: true })).toBeVisible();
    await expect(page.getByText('Transaction status unknown', { exact: true })).toHaveCount(0);
  });

  test('rejects the amount when the balance cannot cover amount plus the sBTC fee', async ({
    extensionId,
    homePage,
    onboardingPage,
    page,
    sendPage,
  }) => {
    await mockSbtcSponsorshipQuote(page, {
      minFeeSats: unaffordableFeeSats,
      maxFeeSats: unaffordableFeeSats,
    });
    await openSbtcSendForm({ extensionId, homePage, onboardingPage, sendPage });

    await waitForSponsoredFeeRow(page);
    await sendPage.previewSendTxButton.click();

    await expect(sendPage.amountInputErrorLabel).toContainText('Insufficient balance');
    await expect(page.getByTestId(SendCryptoAssetSelectors.ConfirmationDetails)).toHaveCount(0);
  });
});
