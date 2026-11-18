import { ChainId, type StacksNetwork } from '@stacks/network';
import { DEFAULT_DEVNET_SERVER } from '~/constants/constants';

import { type NetworkMode } from './stacking-network-types';

const mainnetChainId: number = ChainId.Mainnet;

export function getNetworkInstance(network: StacksNetwork): NetworkMode {
  if (network.chainId === mainnetChainId) {
    return 'mainnet';
  }

  if (network.client.baseUrl === DEFAULT_DEVNET_SERVER) {
    return 'devnet';
  }

  return 'testnet';
}
