import {
  BitcoinNetwork,
  BitcoinNetworkModes,
  ChainId,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';
import { SerializedCryptoAssetId } from '@leather.io/utils';

import type { paths } from '../api/leather/leather-api.types';
import { UserSettings } from './settings.service';

type StakingChainId =
  paths['/v1/staking/addresses/{address}/bonds']['get']['parameters']['query']['chain'];

export function selectBitcoinNetworkMode(settings: UserSettings): BitcoinNetworkModes {
  return settings.network.chain.bitcoin.mode;
}

export function selectBitcoinNetwork(settings: UserSettings): BitcoinNetwork {
  return settings.network.chain.bitcoin.bitcoinNetwork;
}

export function selectNetworkConfigurationId(settings: UserSettings): string {
  return settings.network.id;
}

export function selectStacksApiUrl(settings: UserSettings): string {
  return settings.network.chain.stacks.url;
}

export function selectStacksChainId(settings: UserSettings): ChainId {
  return settings.network.chain.stacks.chainId;
}

export function selectAssetVisibility(
  settings: UserSettings
): Record<SerializedCryptoAssetId, boolean> {
  return settings.assetVisibility;
}

export function selectBitcoinApiUrl(settings: UserSettings): string {
  return settings.network.chain.bitcoin.bitcoinUrl;
}

export function selectStakingChainId(settings: UserSettings): StakingChainId | null {
  const networkId = selectNetworkConfigurationId(settings);
  if (networkId === WalletDefaultNetworkConfigurationIds.mainnet) return 'mainnet';
  if (networkId === WalletDefaultNetworkConfigurationIds['private-1']) return 'private-1';
  return null;
}
