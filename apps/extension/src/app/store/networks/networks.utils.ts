import { ChainId } from '@stacks/network';

import {
  BITCOIN_API_BASE_URL_MAINNET,
  BITCOIN_API_BASE_URL_TESTNET4,
  type BitcoinNetwork,
  type NetworkConfiguration,
  bitcoinNetworkToNetworkMode,
  bitcoinNetworks,
} from '@leather.io/models';

import { PersistedNetworkConfiguration } from './networks.slice';

function checkBitcoinNetworkProperties(
  network: PersistedNetworkConfiguration
): PersistedNetworkConfiguration {
  if (!network.bitcoinNetwork || !network.bitcoinUrl) {
    const bitcoinNetwork = network.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet4';
    return {
      id: network.id,
      name: network.name,
      chainId: network.chainId,
      subnetChainId: network.subnetChainId,
      url: network.url,
      bitcoinNetwork,
      mode: bitcoinNetworkToNetworkMode(bitcoinNetwork),
      bitcoinUrl:
        network.chainId === ChainId.Mainnet
          ? BITCOIN_API_BASE_URL_MAINNET
          : BITCOIN_API_BASE_URL_TESTNET4,
    };
  } else {
    return network;
  }
}

function isValidBitcoinNetwork(network: string): network is BitcoinNetwork {
  return bitcoinNetworks.includes(network as BitcoinNetwork);
}

export function transformNetworkStateToMultichainStucture(
  state: Record<string, PersistedNetworkConfiguration>
) {
  return Object.fromEntries(
    Object.entries(state)
      .map(([key, network]) => {
        if (!network) return ['', null];
        const { id, name, chainId, subnetChainId, url, bitcoinNetwork, bitcoinUrl } =
          checkBitcoinNetworkProperties(network);

        return [
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
        ];
      })
      .filter(([_, value]) => value !== null)
  ) as Record<string, NetworkConfiguration>;
}
