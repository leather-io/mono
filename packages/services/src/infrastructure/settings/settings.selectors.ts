import { BitcoinNetwork, BitcoinNetworkModes, ChainId } from '@leather.io/models';

import { UserSettings } from './settings.service';

export function selectBitcoinNetworkMode(settings: UserSettings): BitcoinNetworkModes {
  return settings.network.chain.bitcoin.mode;
}

export function selectBitcoinNetwork(settings: UserSettings): BitcoinNetwork {
  return settings.network.chain.bitcoin.bitcoinNetwork;
}

export function selectStacksApiUrl(settings: UserSettings): string {
  return settings.network.chain.stacks.url;
}

export function selectStacksChainId(settings: UserSettings): ChainId {
  return settings.network.chain.stacks.chainId;
}
