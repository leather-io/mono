import { LEATHER_MOCK_MODE } from '~/constants/environment';
import { mockLeatherProvider } from '~/mocks/extension/leather-provider.mock';

import { createLeatherClient } from '@leather.io/sdk';

const provider = LEATHER_MOCK_MODE ? mockLeatherProvider : {};

export const leather = createLeatherClient({
  ...provider,
  onProviderNotFound() {
    // TODO: Update store to show no leather installed msg
  },
});

export type StxCallContractParams = Parameters<typeof leather.stxCallContract>[0];
