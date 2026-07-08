import { customNetworkConfig } from '~/constants/custom-network-config';

import type { AuthNetworkId } from '@leather.io/models';

export function resolveWalletRpcNetwork(network: AuthNetworkId): string {
  if (network.endsWith('mainnet')) return 'mainnet';
  return customNetworkConfig?.key ?? 'testnet';
}
