import type { Page } from '@playwright/test';
import {
  makeBitcoinPolicy,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import { GlobalPage } from '@tests/page-object-models/global.page';
import {
  OnboardingPage,
  getConnectedTestAppPermissionsState,
  getTestSoftwareAccountDefaultWalletState,
  makeLedgerTestAccountWalletState,
} from '@tests/page-object-models/onboarding.page';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import type { AccountType, SessionMode } from './verify-options';

export interface SessionTarget {
  page: Page;
  extensionId: string;
  networkId: string;
  accountType: AccountType;
  connectTestApp: boolean;
  mnemonic: string | undefined;
}

export function makeNetworkStateOverride(networkId: string) {
  return { networks: { ids: [], entities: {}, currentNetworkId: networkId } };
}

function makeSignedInStateOverrides({ networkId, connectTestApp, accountType }: SessionTarget) {
  const policyId = accountType === 'policy' ? makeBitcoinPolicy().id : undefined;
  return {
    ...makeNetworkStateOverride(networkId),
    ...(connectTestApp ? getConnectedTestAppPermissionsState({ policyId }) : {}),
  };
}

interface AccountEstablisher {
  establish(onboardingPage: OnboardingPage, extensionId: string, overrides: object): Promise<void>;
}

const accountEstablishers: Record<AccountType, AccountEstablisher> = {
  software: {
    async establish(onboardingPage, extensionId, overrides) {
      await onboardingPage.signInWithTestAccount(extensionId, overrides);
    },
  },
  ledger: {
    async establish(onboardingPage, extensionId, overrides) {
      await onboardingPage.signInWithLedgerAccount(extensionId, {
        ...makeLedgerTestAccountWalletState(['bitcoin', 'stacks']),
        ...overrides,
      });
    },
  },
  mixed: {
    async establish(onboardingPage, extensionId, overrides) {
      await onboardingPage.signInWithMixedSoftwareAndLedgerWallets(extensionId, overrides);
    },
  },
  policy: {
    async establish(onboardingPage, extensionId, overrides) {
      const bitcoinPolicy = makeBitcoinPolicy();
      const stacksPolicy = makeStacksPolicy();
      await onboardingPage.signInWithTestAccount(extensionId, {
        ...overrides,
        ...policyStateOverrides({
          policies: [bitcoinPolicy, stacksPolicy],
          activePolicyId: bitcoinPolicy.id,
        }),
      });
    },
  },
};

interface SessionEstablisher {
  establish(target: SessionTarget): Promise<void>;
}

const sessionEstablishers: Record<SessionMode, SessionEstablisher> = {
  'signed-in': {
    async establish(target) {
      await accountEstablishers[target.accountType].establish(
        new OnboardingPage(target.page),
        target.extensionId,
        makeSignedInStateOverrides(target)
      );
    },
  },
  'signed-out': {
    async establish({ page, mnemonic }) {
      if (mnemonic === undefined) {
        await page.getByTestId(OnboardingSelectors.SignUpBtn).waitFor();
        return;
      }
      const onboardingPage = new OnboardingPage(page);
      await onboardingPage.signInExistingUser(mnemonic);
      await onboardingPage.dismissFeatureIntroducer();
    },
  },
  locked: {
    async establish({ page, extensionId, networkId }) {
      await new OnboardingPage(page).seedWalletStateAndWaitFor(
        extensionId,
        { ...getTestSoftwareAccountDefaultWalletState(), ...makeNetworkStateOverride(networkId) },
        () => page.getByTestId(SettingsSelectors.EnterPasswordInput).isVisible()
      );
    },
  },
};

export async function establishSession(session: SessionMode, target: SessionTarget) {
  const globalPage = new GlobalPage(target.page);
  await globalPage.gotoNakedRoot(target.extensionId);
  await globalPage.waitForOnboardingOrHome();
  await sessionEstablishers[session].establish(target);
}
