import { LEATHER_MOCK_MODE } from '~/constants/environment';
import { mockLeatherProvider } from '~/mocks/extension/leather-provider.mock';

import { createLeatherClient, isBrowser } from '@leather.io/sdk';

const provider = LEATHER_MOCK_MODE ? mockLeatherProvider : {};

if (LEATHER_MOCK_MODE && isBrowser()) {
  (window as any).LeatherProvider = mockLeatherProvider;
}

export const leather = createLeatherClient(provider);

export type StxCallContractParams = Parameters<typeof leather.stxCallContract>[0];
