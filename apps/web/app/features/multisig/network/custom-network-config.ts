import type { CustomNetworkConfig } from '~/constants/custom-network';

import { ChainId, type NetworkConfiguration } from '@leather.io/models';

export function buildCustomNetworkConfiguration(config: CustomNetworkConfig): NetworkConfiguration {
  const bitcoinNetwork = config.flavor === 'regtest' ? 'regtest' : 'testnet3';
  return {
    id: config.key,
    name: config.name,
    chain: {
      bitcoin: {
        blockchain: 'bitcoin',
        bitcoinUrl: config.bitcoinApiUrl,
        bitcoinNetwork,
        mode: config.flavor,
      },
      stacks: {
        blockchain: 'stacks',
        url: config.stacksApiUrl,
        chainId: config.stacksChainId ?? ChainId.Testnet,
      },
    },
  };
}
