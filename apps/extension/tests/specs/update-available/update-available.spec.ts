import { type Page, expect } from '@playwright/test';
import { makeLedgerTestAccountWalletState } from '@tests/page-object-models/onboarding.page';
import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { UpdateAvailableSelectors } from '@tests/selectors/update-available.selectors';

import { extensionUpdateStorageKeys } from '@shared/extension-update';

import { makeUpdateAvailableMessageId } from '@app/features/update-available/update-available.utils';

import { test } from '../../fixtures/fixtures';

const pendingUpdateVersion = '99.0.0';

async function flagPendingUpdate(page: Page) {
  await page.evaluate(
    async ([key, version]) => chrome.storage.session.set({ [key]: version }),
    [extensionUpdateStorageKeys.pendingVersion, pendingUpdateVersion]
  );
}

test.describe('Update available callout', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithTestAccount(extensionId);
    await expect(page.getByTestId(HomePageSelectors.TokensTabBtn)).toBeVisible();
  });

  test('is hidden while no update is pending', async ({ page }) => {
    await expect(page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCallout)).toHaveCount(0);
  });

  test('appears when the background script flags a pending update', async ({ page }) => {
    await flagPendingUpdate(page);

    await expect(page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCallout)).toBeVisible();
    await expect(page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCallout)).toContainText(
      'Updating locks your wallet'
    );
    await expect(
      page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCalloutUpdateNow)
    ).toBeVisible();
  });

  test('confirms the new version once the update has been applied', async ({
    page,
    extensionId,
  }) => {
    await page.evaluate(
      async key => chrome.storage.local.set({ [key]: chrome.runtime.getManifest().version }),
      extensionUpdateStorageKeys.appliedVersion
    );
    await page.goto(`chrome-extension://${extensionId}/index.html`);

    const version = await page.evaluate(() => chrome.runtime.getManifest().version);
    await expect(
      page.getByText(`Leather is updated to ${version}`, { exact: true }).first()
    ).toBeVisible();

    await page.goto(`chrome-extension://${extensionId}/index.html`);
    await expect(page.getByTestId(HomePageSelectors.TokensTabBtn)).toBeVisible();
    await expect(page.getByText(`Leather is updated to ${version}`, { exact: true })).toHaveCount(
      0
    );
  });

  test('stays dismissed for that version once postponed', async ({ page, extensionId }) => {
    await flagPendingUpdate(page);
    await expect(page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCallout)).toBeVisible();

    await page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCalloutLater).click();
    await expect(page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCallout)).toHaveCount(0);

    await expect
      .poll(async () =>
        page.evaluate(async messageId => {
          const stored = await chrome.storage.local.get('persist:root');
          return JSON.stringify(stored['persist:root'] ?? '').includes(messageId);
        }, makeUpdateAvailableMessageId(pendingUpdateVersion))
      )
      .toBe(true);

    await page.goto(`chrome-extension://${extensionId}/index.html`);
    await expect(page.getByTestId(HomePageSelectors.TokensTabBtn)).toBeVisible();
    await expect(page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCallout)).toHaveCount(0);
  });
});

test.describe('Update available callout without a password', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await onboardingPage.signInWithLedgerAccount(
      extensionId,
      makeLedgerTestAccountWalletState(['bitcoin', 'stacks'])
    );
    await expect(page.getByTestId(HomePageSelectors.TokensTabBtn)).toBeVisible();
  });

  test('does not warn about locking a Ledger-only wallet', async ({ page }) => {
    await flagPendingUpdate(page);

    const callout = page.getByTestId(UpdateAvailableSelectors.UpdateAvailableCallout);
    await expect(callout).toBeVisible();
    await expect(callout).toContainText('It installs the next time you relaunch your browser.');
    await expect(callout).not.toContainText('locks your wallet');
  });
});
