import { customNetwork } from '~/constants/custom-network';

import type { AuthNetworkId, BitcoinNetworkModes } from '@leather.io/models';

// Mirrors the backend network resolver: btc:mainnet always resolves to real
// mainnet; the btc:testnet slot is reinterpreted as the custom network's flavor
// (regtest => bcrt1) when a custom network is active, otherwise standard testnet.
export function resolveBtcNetworkMode(network: AuthNetworkId): BitcoinNetworkModes {
  if (network === 'btc:mainnet') return 'mainnet';
  if (customNetwork?.flavor === 'regtest') return 'regtest';
  return 'testnet';
}
