import { customNetwork } from '~/constants/custom-network';

import type { AuthNetworkId, BitcoinNetworkModes } from '@leather.io/models';

// btc:mainnet stays mainnet; the testnet slot uses the custom flavor (regtest) when active.
export function resolveBtcNetworkMode(network: AuthNetworkId): BitcoinNetworkModes {
  if (network === 'btc:mainnet') return 'mainnet';
  if (customNetwork?.flavor === 'regtest') return 'regtest';
  return 'testnet';
}
