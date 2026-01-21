import { asyncWithLDProvider, useFlags as useLDFlags } from 'launchdarkly-react-client-sdk';

import { getClientId } from '@app/common/client-id';

function NoopProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function createLDProvider() {
  if (!process.env.LAUNCH_DARKLY_KEY) return NoopProvider;

  return asyncWithLDProvider({
    clientSideID: process.env.LAUNCH_DARKLY_KEY ?? '',
    options: {
      application: {
        id: 'leather-extension-wallet',
        version: VERSION,
      },
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
  extensionRevamp: boolean;
  collectiblesRevamp: boolean;
  accountRevamp: boolean;
}

export function useFlags() {
  return useLDFlags<FeatureFlags>();
}
