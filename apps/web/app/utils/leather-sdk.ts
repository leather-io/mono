import { getLeatherMockMode } from '~/constants/environment';
import { mockLeatherProvider, mockWalletProvider } from '~/mocks/extension/leather-provider.mock';

import { createLeatherClient, isBrowser } from '@leather.io/sdk';

const isMockMode = getLeatherMockMode();
const provider = isMockMode ? mockLeatherProvider : {};

if (isMockMode && isBrowser()) {
  (window as any).LeatherProvider = mockWalletProvider;
}

export const leather = createLeatherClient(provider);

export type StxCallContractParams = Parameters<typeof leather.stxCallContract>[0];
