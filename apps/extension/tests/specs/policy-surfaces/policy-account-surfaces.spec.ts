import { expect } from '@playwright/test';
import { makeStacksPolicy, policyStateOverrides } from '@tests/mocks/mock-policies';
import { mockStacksPolicyData } from '@tests/mocks/mock-policy-data';
import { mockBnsV2NamesRequestEmpty } from '@tests/mocks/mock-stacks-bns';
import { CollectiblesSelectors } from '@tests/selectors/collectibles.selectors';
import { MockedTokensSelectors } from '@tests/selectors/mocked-tokens.selectors';
import { TokenDetailsSelectors } from '@tests/selectors/token-details.selectors';

import { test } from '../../fixtures/fixtures';

const stacksPolicy = makeStacksPolicy();

test.describe('Policy (multisig) account surfaces', () => {
  test.describe('with a Stacks multisig active', () => {
    test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
      await globalPage.setupAndUseApiCalls(extensionId);
      await mockBnsV2NamesRequestEmpty(page);
      await mockStacksPolicyData(page, stacksPolicy.address);
      await onboardingPage.signInWithTestAccount(
        extensionId,
        policyStateOverrides({
          policies: [stacksPolicy],
          activePolicyId: stacksPolicy.id,
          names: { [stacksPolicy.id]: 'Treasury' },
        })
      );
    });

    test('lists SIP10 tokens for the multisig address', async ({ homePage }) => {
      await homePage.clickTokensTab();

      await expect(
        homePage.assetList.getByTestId(MockedTokensSelectors.Sip10TokenTestId)
      ).toBeVisible();
    });

    test('shows the multisig address activity', async ({ homePage, page }) => {
      await homePage.clickActivityTab();

      await expect(page.getByText('Received').first()).toBeVisible();
    });

    test('shows the multisig collectibles', async ({ homePage, page }) => {
      await homePage.clickCollectiblesTab();

      await expect(page.getByTestId(CollectiblesSelectors.CollectibleCardSip9)).toBeVisible();
    });

    test('opens policy-aware SIP10 token details', async ({ homePage, page }) => {
      await homePage.clickTokensTab();
      await homePage.assetList.getByTestId(MockedTokensSelectors.Sip10TokenTestId).click();

      await expect(page.getByTestId(TokenDetailsSelectors.TokenDetailsContainer)).toBeVisible();

      const amount = page.getByTestId(TokenDetailsSelectors.TokenOverviewAmount);
      await expect(amount).toBeVisible();
      expect((await amount.innerText()).toLowerCase()).toContain('long');
    });
  });
});
