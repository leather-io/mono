import {
  makeBitcoinPolicy,
  makeStacksPolicy,
  policyStateOverrides,
} from '@tests/mocks/mock-policies';
import type { HomePage } from '@tests/page-object-models/home.page';
import {
  type OnboardingPage,
  getConnectedTestAppPermissionsState,
  getTestSoftwareAccountDefaultWalletState,
  makeLedgerTestAccountWalletState,
} from '@tests/page-object-models/onboarding.page';

import type { VerifyAccountType, VerifyRun } from '@leather.io/tools/verify-contract';

export interface SessionPages {
  readonly extensionId: string;
  readonly onboardingPage: OnboardingPage;
  readonly homePage: HomePage;
}

const defaultNetworkId = 'mainnet';

export function networkStateOverride(networkId: string): object {
  if (networkId === defaultNetworkId) return {};
  return { networks: { ids: [], entities: {}, currentNetworkId: networkId } };
}

interface AccountEstablisher {
  establish(pages: SessionPages, overrides: object): Promise<void>;
}

const accountEstablishers: Readonly<Record<VerifyAccountType, AccountEstablisher>> = {
  software: {
    async establish({ extensionId, onboardingPage }, overrides) {
      await onboardingPage.signInWithTestAccount(extensionId, overrides);
    },
  },
  ledger: {
    async establish({ extensionId, onboardingPage }, overrides) {
      await onboardingPage.signInWithLedgerAccount(extensionId, {
        ...makeLedgerTestAccountWalletState(['bitcoin', 'stacks']),
        ...overrides,
      });
    },
  },
  mixed: {
    async establish({ extensionId, onboardingPage }, overrides) {
      await onboardingPage.signInWithMixedSoftwareAndLedgerWallets(extensionId, overrides);
    },
  },
  policy: {
    async establish({ extensionId, onboardingPage }, overrides) {
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

function notificationsOffOverride(): object {
  const { settings } = getTestSoftwareAccountDefaultWalletState();
  return { settings: { ...settings, isNotificationsEnabled: false } };
}

function signedInOverrides(run: VerifyRun): object {
  const policyId = run.accountType === 'policy' ? makeBitcoinPolicy().id : undefined;
  return {
    ...notificationsOffOverride(),
    ...networkStateOverride(run.network),
    ...(run.connectTestApp ? getConnectedTestAppPermissionsState({ policyId }) : {}),
  };
}

export async function establishSession(run: VerifyRun, pages: SessionPages) {
  if (run.session === 'signed-out') return;
  await accountEstablishers[run.accountType].establish(pages, signedInOverrides(run));
  if (run.session === 'locked') await pages.homePage.lock();
}
