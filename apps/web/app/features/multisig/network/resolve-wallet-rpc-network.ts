import { customNetwork } from '~/constants/custom-network';

import type { AuthNetworkId } from '@leather.io/models';

export function resolveWalletRpcNetwork(network: AuthNetworkId): string {
  if (network.endsWith('mainnet')) return 'mainnet';
  return customNetwork?.key ?? 'testnet';
}
