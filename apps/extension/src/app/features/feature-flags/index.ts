import { asyncWithLDProvider, useFlags as useLDFlags } from 'launchdarkly-react-client-sdk';

import { getClientId } from '@app/common/client-id';

export function createLDProvider() {
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
    reactOptions: { useCamelCaseFlagKeys: false },
  });
}

interface FeatureFlags {
  release_onramper_buy: boolean;
  extension_revamp: boolean;
  extension_asset_balances: boolean;
}

export function useFlags() {
  return useLDFlags<FeatureFlags>();
}
