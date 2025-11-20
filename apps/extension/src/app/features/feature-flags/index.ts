import { asyncWithLDProvider, useFlags as useLDFlags } from 'launchdarkly-react-client-sdk';

import { getClientId } from '@app/common/client-id';
import { featureFlagDefaults, type FeatureFlags } from '@leather.io/models';

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
