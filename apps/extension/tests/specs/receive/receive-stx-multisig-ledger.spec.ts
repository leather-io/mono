import { expect } from '@playwright/test';
import {
  exampleStacksMultisigPublicKeys,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import { mockStacksPolicyData } from '@tests/mocks/mock-policy-data';
import { makeLedgerTestAccountWalletState } from '@tests/page-object-models/onboarding.page';
import { HomePageSelectors } from '@tests/selectors/home.selectors';

import { deriveStxMultisigAddress } from '@leather.io/stacks';

import { test } from '../../fixtures/fixtures';

const mainnetChainId = 1;
const stacksPolicy = makeStacksPolicy({
  address: deriveStxMultisigAddress({
    publicKeys: exampleStacksMultisigPublicKeys,
    threshold: 2,
    chainId: mainnetChainId,
  }),
});

test.describe('Receive: Stacks multisig address verification on Ledger', () => {
  test.beforeEach(async ({ extensionId, globalPage, onboardingPage, page }) => {
    await globalPage.setupAndUseApiCalls(extensionId);
    await mockStacksPolicyData(page, stacksPolicy.address);
    await onboardingPage.signInWithLedgerAccount(extensionId, {
      ...makeLedgerTestAccountWalletState(['stacks']),
      ...policyStateOverrides({ policies: [stacksPolicy], activePolicyId: stacksPolicy.id }),
    });
  });

  test('offers on-device verification and opens the ledger flow', async ({ homePage }) => {
    test.slow();
    await homePage.goToReceiveDialog();

    const dialog = homePage.page.getByRole('dialog');
    await expect(dialog.getByText(stacksPolicy.address)).toBeVisible();

    const verifyButton = homePage.page.getByTestId(HomePageSelectors.ReceiveSheetVerifyAddressBtn);
    await expect(verifyButton).toBeVisible();
    await verifyButton.click();

    await expect(homePage.page.getByText('Connect & unlock your Ledger')).toBeVisible({
      timeout: 20_000,
    });
  });
});
