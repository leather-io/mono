import { asyncWithLDProvider, useFlags as useLDFlags } from 'launchdarkly-react-client-sdk';

import { IS_TEST_ENV } from '@shared/environment';

import { getClientId } from '@app/common/client-id';

function NoopProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function createLaunchDarklyProvider() {
  if (!process.env.LAUNCH_DARKLY_KEY) return NoopProvider;

  return asyncWithLDProvider({
    clientSideID: process.env.LAUNCH_DARKLY_KEY ?? '',
    options: {
      application: {
        id: 'leather-extension-wallet',
        version: VERSION,
      },
      // In integration tests the streaming endpoint isn't served, so the SDK
      // reconnects in a loop and starves the main thread. Disable streaming so
      // flags resolve from the initial fetch only.
      ...(IS_TEST_ENV ? { streaming: false } : {}),
    },
    context: {
      kind: 'clientId',
      key: getClientId(),
    },
    reactOptions: { useCamelCaseFlagKeys: true },
  });
}

interface FeatureFlags {
  releaseOnramperBuy: boolean;
  releaseOnramperSell: boolean;
  assetsRevamp: boolean;
  activityRevamp: boolean;
  swapRevamp: boolean;
  releaseTrendingTokens: boolean;
  releaseAddAccount: boolean;
  enableAllowPolicyAccounts: boolean;
}

export function useFlags() {
  return useLDFlags<FeatureFlags>();
}
