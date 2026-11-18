import { expect } from '@playwright/test';
import {
  makeBitcoinPolicy,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import { mockBnsV2NamesRequestEmpty } from '@tests/mocks/mock-stacks-bns';
import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { test } from '../../fixtures/fixtures';

const bitcoinPolicy = makeBitcoinPolicy();
const stacksPolicy = makeStacksPolicy();

test.describe('Policy (multisig) accounts', () => {
  test.describe('with a Bitcoin multisig registered', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockBnsV2NamesRequestEmpty(page);
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({
          policies: [bitcoinPolicy],
          names: { [bitcoinPolicy.id]: 'Family vault' },
        })
      );
    });

    test('lists the multisig nested beneath its parent account', async ({ switchAccountPage }) => {
      await switchAccountPage.open();

      await expect(switchAccountPage.policyRow(bitcoinPolicy.id)).toBeVisible();
      await expect(switchAccountPage.policyRow(bitcoinPolicy.id)).toContainText('Family vault');
    });

    test('switches to the multisig and shows a single-chain Bitcoin view', async ({
      page,
      switchAccountPage,
    }) => {
      // The single-sig account exposes the collectibles tab before switching
      await expect(page.getByTestId(HomePageSelectors.CollectiblesTabBtn)).toBeVisible();

      await switchAccountPage.open();
      await switchAccountPage.policyRow(bitcoinPolicy.id).click();

      await expect(switchAccountPage.currentAccountName).toHaveText('Family vault');
      await expect.poll(() => switchAccountPage.getActivePolicyId()).toBe(bitcoinPolicy.id);

      // A Bitcoin multisig hides the collectibles tab and the send button, and
      // offers only a receive action
      await expect(page.getByTestId(HomePageSelectors.CollectiblesTabBtn)).toHaveCount(0);
      await expect(page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn)).toBeVisible();
      await expect(page.getByTestId(HomePageSelectors.SendCryptoAssetBtn)).toBeVisible();
    });

    test('renames the multisig from manage mode', async ({ switchAccountPage }) => {
      await switchAccountPage.open();
      await switchAccountPage.enterManageMode();
      await switchAccountPage.renamePolicy('Cold storage');

      await expect(switchAccountPage.policyRow(bitcoinPolicy.id)).toContainText('Cold storage');
    });

    test('removes the multisig from manage mode', async ({ switchAccountPage }) => {
      await switchAccountPage.open();
      await switchAccountPage.enterManageMode();
      await switchAccountPage.removePolicy();

      await expect(switchAccountPage.policyRow(bitcoinPolicy.id)).toHaveCount(0);
      await expect.poll(() => switchAccountPage.getPersistedPolicyIds()).toEqual([]);
    });
  });

  test.describe('with a Stacks multisig registered', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockBnsV2NamesRequestEmpty(page);
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({
          policies: [stacksPolicy],
          names: { [stacksPolicy.id]: 'Treasury' },
        })
      );
    });

    test('keeps the collectibles tab when switching to a Stacks multisig', async ({
      page,
      switchAccountPage,
    }) => {
      await switchAccountPage.open();
      await switchAccountPage.policyRow(stacksPolicy.id).click();

      await expect(switchAccountPage.currentAccountName).toHaveText('Treasury');
      await expect(page.getByTestId(HomePageSelectors.CollectiblesTabBtn)).toBeVisible();
      await expect(page.getByTestId(HomePageSelectors.ReceiveCryptoAssetBtn)).toBeVisible();
    });
  });
});
