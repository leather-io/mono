import type { Page } from '@playwright/test';
import { GlobalPage } from '@tests/page-object-models/global.page';
import {
  OnboardingPage,
  getTestSoftwareAccountDefaultWalletState,
} from '@tests/page-object-models/onboarding.page';
import { OnboardingSelectors } from '@tests/selectors/onboarding.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';

import type { SessionMode } from './verify-options';

export interface SessionTarget {
  page: Page;
  extensionId: string;
  networkId: string;
}

export function makeNetworkStateOverride(networkId: string) {
  return { networks: { ids: [], entities: {}, currentNetworkId: networkId } };
}

interface SessionEstablisher {
  establish(target: SessionTarget): Promise<void>;
}

const sessionEstablishers: Record<SessionMode, SessionEstablisher> = {
  'signed-in': {
    async establish({ page, extensionId, networkId }) {
      await new OnboardingPage(page).signInWithTestAccount(
        extensionId,
        makeNetworkStateOverride(networkId)
      );
    },
  },
  'signed-out': {
    async establish({ page }) {
      await page.getByTestId(OnboardingSelectors.SignUpBtn).waitFor();
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
  await new GlobalPage(target.page).setupAndUseApiCalls(target.extensionId);
  await sessionEstablishers[session].establish(target);
}
