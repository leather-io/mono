import type { AuthNetworkId } from '@leather.io/models';

import type { Chain } from './data/multisig-types';

export function chainFromNetwork(network: AuthNetworkId): Chain {
  return network.startsWith('btc') ? 'btc' : 'stx';
}
