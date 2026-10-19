import { customNetworkConfig } from '~/constants/custom-network-config';

import type { AuthNetworkId } from '@leather.io/models';

export function resolveWalletRpcNetwork(network: AuthNetworkId): string {
  if (network.endsWith('mainnet')) return 'mainnet';
  if (customNetworkConfig) return customNetworkConfig.key;
  return network === 'btc:testnet' ? 'testnet3' : 'testnet';
}
