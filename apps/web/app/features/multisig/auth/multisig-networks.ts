import type { StacksNetworkName } from '@stacks/network';
import { customNetwork } from '~/constants/custom-network';

import type { AuthNetworkId } from '@leather.io/models';

type MultisigNetworkMode = 'mainnet' | 'testnet';

export interface MultisigNetworks {
  btc: AuthNetworkId;
  stx: AuthNetworkId;
}

function resolveBtcNetwork(mode: MultisigNetworkMode): AuthNetworkId {
  if (mode === 'mainnet') return 'btc:mainnet';
  if (customNetwork?.flavor === 'regtest') return 'btc:regtest';
  return 'btc:testnet';
}

export function resolveMultisigNetworks(networkName: StacksNetworkName): MultisigNetworks {
  const mode: MultisigNetworkMode = networkName === 'mainnet' ? 'mainnet' : 'testnet';
  return { btc: resolveBtcNetwork(mode), stx: `stx:${mode}` };
}
