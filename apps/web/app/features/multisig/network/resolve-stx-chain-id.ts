import { customNetwork } from '~/constants/custom-network';

import type { AuthNetworkId } from '@leather.io/models';
import { stxChainIdByAuthNetworkId } from '@leather.io/stacks';

export function resolveStxChainId(network: AuthNetworkId): number {
  if (network === 'stx:mainnet') return stxChainIdByAuthNetworkId[network];
  return customNetwork?.stacksChainId ?? stxChainIdByAuthNetworkId[network];
}
