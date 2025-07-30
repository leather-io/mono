import { ChainId, StacksNetwork, StacksNetworkName } from '@stacks/network';
import { DEFAULT_DEVNET_SERVER } from '~/constants/constants';

import { NetworkMode } from './stacking-network-types';

export function getNetworkInstance(network: StacksNetwork): NetworkMode {
  if (network.chainId === ChainId.Mainnet) {
    return 'mainnet';
  }

  if (network.client.baseUrl === DEFAULT_DEVNET_SERVER) {
    return 'devnet';
  }

  return 'testnet';
}

export function getNetworkInstanceByName(networkName: StacksNetworkName) {
  if (networkName === 'mainnet' || networkName === 'devnet') {
    return networkName;
  }

  return 'testnet';
}
