import { Page, expect } from '@playwright/test';
import {
  TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS,
  TEST_ACCOUNT_1_STX_ADDRESS,
  TEST_ACCOUNT_2_STX_ADDRESS,
} from '@tests/mocks/constants';
import { mockBnsV2NamesRequestEmpty } from '@tests/mocks/mock-stacks-bns';
import { HomePage } from '@tests/page-object-models/home.page';
import { mixedLedgerFingerprint, testFingerprint } from '@tests/page-object-models/onboarding.page';
import { SendPage } from '@tests/page-object-models/send.page';
import { getRecipientSelectAccountTestId } from '@tests/selectors/send.selectors';
import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';

import { test } from '../../fixtures/fixtures';

const softwareAccountRow = (index: number) =>
  getRecipientSelectAccountTestId(testFingerprint, index);
const ledgerAccountRow = (index: number) =>
  getRecipientSelectAccountTestId(mixedLedgerFingerprint, index);

async function openRecipientAccounts(
  asset: 'btc' | 'stx',
  { homePage, sendPage, page }: { homePage: HomePage; sendPage: SendPage; page: Page }
) {
  await homePage.sendButton.click();
  if (asset === 'btc') {
    await sendPage.selectBtcAndGoToSendForm();
    // `send-page-ready` is only rendered by the BTC form
    await sendPage.waitForSendPageReady();
  } else {
    await sendPage.selectStxAndGoToSendForm();
  }
  await sendPage.recipientChooseAccountButton.click();
  await page.getByRole('heading', { name: 'Select account' }).waitFor();
}

async function reopenRecipientAccounts({ sendPage, page }: { sendPage: SendPage; page: Page }) {
  await sendPage.recipientChooseAccountButton.click();
  await page.getByRole('heading', { name: 'Select account' }).waitFor();
}

test.describe('send recipient account selector (multiwallet)', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    // Keep account names deterministic by resolving no BNS names
    await mockBnsV2NamesRequestEmpty(page);
    await onboardingPage.signInWithMixedSoftwareAndLedgerWallets(extensionId);
  });

  test('that accounts are grouped under their wallet with the correct per-wallet counts', async ({
    homePage,
    sendPage,
    page,
  }) => {
    await openRecipientAccounts('btc', { homePage, sendPage, page });

    // Two wallet groups, in creation order
    const walletHeaders = page.getByTestId(SwitchAccountSelectors.WalletHeaderName);
    await expect(walletHeaders).toHaveCount(2);
    await expect(walletHeaders.nth(0)).toHaveText('Wallet 1');
    await expect(walletHeaders.nth(1)).toHaveText('My Ledger');

    // Software wallet has exactly 2 accounts
    await expect(page.getByTestId(softwareAccountRow(0))).toBeVisible();
    await expect(page.getByTestId(softwareAccountRow(1))).toBeVisible();
    await expect(page.getByTestId(softwareAccountRow(2))).toHaveCount(0);

    // Ledger wallet has exactly 5 accounts, under its own fingerprint (not
    // merged into the software wallet's group). The list is virtualized, so
    // scroll down to render the last account.
    await expect(page.getByTestId(ledgerAccountRow(0))).toBeVisible();
    await page.getByTestId(ledgerAccountRow(0)).hover();
    await page.mouse.wheel(0, 2000);
    await expect(page.getByTestId(ledgerAccountRow(4))).toBeVisible();
    await expect(page.getByTestId(ledgerAccountRow(5))).toHaveCount(0);
  });

  test('that selecting an account fills the recipient field with its BTC address', async ({
    homePage,
    sendPage,
    page,
  }) => {
    await openRecipientAccounts('btc', { homePage, sendPage, page });

    // Software account: exact known native segwit address
    await page.getByTestId(softwareAccountRow(0)).click();
    await expect(sendPage.recipientInput).toHaveValue(TEST_ACCOUNT_1_NATIVE_SEGWIT_ADDRESS);

    // Ledger account: a valid mainnet native segwit address is filled
    await reopenRecipientAccounts({ sendPage, page });
    await page.getByTestId(ledgerAccountRow(0)).click();
    await expect(sendPage.recipientInput).toHaveValue(/^bc1q[a-z0-9]{38,}$/);
  });

  test('that selecting an account fills the recipient field with its STX address', async ({
    homePage,
    sendPage,
    page,
  }) => {
    await openRecipientAccounts('stx', { homePage, sendPage, page });

    // Software account 0 and account 1: exact known Stacks addresses
    await page.getByTestId(softwareAccountRow(0)).click();
    await expect(sendPage.recipientInput).toHaveValue(TEST_ACCOUNT_1_STX_ADDRESS);

    await reopenRecipientAccounts({ sendPage, page });
    await page.getByTestId(softwareAccountRow(1)).click();
    await expect(sendPage.recipientInput).toHaveValue(TEST_ACCOUNT_2_STX_ADDRESS);

    // Ledger account: a valid mainnet Stacks address is filled
    await reopenRecipientAccounts({ sendPage, page });
    await page.getByTestId(ledgerAccountRow(0)).click();
    await expect(sendPage.recipientInput).toHaveValue(/^SP[0-9A-Z]{37,}$/);
  });
});
