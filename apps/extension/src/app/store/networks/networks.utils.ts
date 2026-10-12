import {
  BITCOIN_API_BASE_URL_MAINNET,
  BITCOIN_API_BASE_URL_TESTNET4,
  type BitcoinNetwork,
  type NetworkConfiguration,
  bitcoinNetworkToNetworkMode,
  bitcoinNetworks,
} from '@leather.io/models';
import { stacksChainIdToCoreNetworkMode } from '@leather.io/stacks';

import { type PersistedNetworkConfiguration } from './networks.slice';

function checkBitcoinNetworkProperties(
  network: PersistedNetworkConfiguration
): PersistedNetworkConfiguration {
  if (!network.bitcoinNetwork || !network.bitcoinUrl) {
    const isMainnet = stacksChainIdToCoreNetworkMode(network.chainId) === 'mainnet';
    const bitcoinNetwork = isMainnet ? 'mainnet' : 'testnet4';
    return {
      id: network.id,
      name: network.name,
      chainId: network.chainId,
      subnetChainId: network.subnetChainId,
      url: network.url,
      bitcoinNetwork,
      mode: bitcoinNetworkToNetworkMode(bitcoinNetwork),
      bitcoinUrl: isMainnet ? BITCOIN_API_BASE_URL_MAINNET : BITCOIN_API_BASE_URL_TESTNET4,
    };
  } else {
    return network;
  }
}

function isValidBitcoinNetwork(network: string): network is BitcoinNetwork {
  return bitcoinNetworks.some(bitcoinNetwork => bitcoinNetwork === network);
}

export function transformNetworkStateToMultichainStucture(
  state: Record<string, PersistedNetworkConfiguration>
): Record<string, NetworkConfiguration> {
  return Object.fromEntries(
    Object.entries(state).flatMap(([key, network]): [string, NetworkConfiguration][] => {
      if (!network) return [];
      const { id, name, chainId, subnetChainId, url, bitcoinNetwork, bitcoinUrl } =
        checkBitcoinNetworkProperties(network);

      return [
        [
          key,
          {
            id,
            name,
            chain: {
              stacks: {
                blockchain: 'stacks',
                url,
                chainId,
                subnetChainId,
              },
              bitcoin: {
                blockchain: 'bitcoin',
                bitcoinNetwork: isValidBitcoinNetwork(bitcoinNetwork) ? bitcoinNetwork : 'testnet4',
                mode: isValidBitcoinNetwork(bitcoinNetwork)
                  ? bitcoinNetworkToNetworkMode(bitcoinNetwork)
                  : 'testnet',
                bitcoinUrl: bitcoinUrl ?? BITCOIN_API_BASE_URL_TESTNET4,
              },
            },
          },
        ],
      ];
    })
  );
}
