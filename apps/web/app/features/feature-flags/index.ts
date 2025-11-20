import { asyncWithLDProvider, useFlags as useLDFlags } from 'launchdarkly-react-client-sdk';
import { VERSION } from '~/constants/constants';
import { getClientId } from '~/utils/client-id';

import { type FeatureFlags, featureFlagDefaults } from '@leather.io/models';

export function createLDProvider() {
  return asyncWithLDProvider({
    clientSideID: import.meta.env.LEATHER_LAUNCH_DARKLY_KEY ?? '',
    options: {
      application: {
        id: 'leather-web',
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
