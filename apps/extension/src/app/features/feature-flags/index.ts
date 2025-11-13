import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk';

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
