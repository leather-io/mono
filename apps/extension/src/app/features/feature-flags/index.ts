import { asyncWithLDProvider, useFlags as useLDFlags } from 'launchdarkly-react-client-sdk';

import { type FeatureFlags, featureFlagDefaults } from '@leather.io/models';

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
    reactOptions: { useCamelCaseFlagKeys: true },
  });
}

export function useFlags(): FeatureFlags {
  const flags = useLDFlags<FeatureFlags>();
  return { ...featureFlagDefaults, ...flags };
}
