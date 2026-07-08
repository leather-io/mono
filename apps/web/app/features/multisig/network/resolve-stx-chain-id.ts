import { customNetworkConfig } from '~/constants/custom-network-config';

import type { AuthNetworkId } from '@leather.io/models';
import { stxChainIdByAuthNetworkId } from '@leather.io/stacks';

export function resolveStxChainId(network: AuthNetworkId): number {
  if (network === 'stx:mainnet') return stxChainIdByAuthNetworkId[network];
  return customNetworkConfig?.stacksChainId ?? stxChainIdByAuthNetworkId[network];
}
