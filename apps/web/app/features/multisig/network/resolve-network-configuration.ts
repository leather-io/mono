import { StacksNetworkName } from '@stacks/network';
import { customNetworkConfig } from '~/constants/custom-network-config';

import { type NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { buildCustomNetworkConfiguration } from './build-custom-network-configuration';

// Shared by the settings service and the network store: when they disagreed,
// one talked to the private network while the other talked to public testnet.
export function resolveNetworkConfiguration(
  networkName: Exclude<StacksNetworkName, 'mocknet'>
): NetworkConfiguration {
  if (customNetworkConfig && networkName === 'testnet') {
    return buildCustomNetworkConfiguration(customNetworkConfig);
  }
  return defaultNetworksKeyedById[networkName];
}
