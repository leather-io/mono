import type { AuthNetworkId } from '@leather.io/models';

import type { Chain } from './data/multisig-types';

export function chainFromNetwork(network: AuthNetworkId): Chain {
  return network.startsWith('btc') ? 'btc' : 'stx';
}

// Canonical block-explorer URL for a broadcast/confirmed transaction: mempool.space
// for Bitcoin, the Hiro explorer for Stacks.
export function transactionExplorerUrl(network: AuthNetworkId, txId: string): string {
  if (network.startsWith('btc')) {
    const base =
      network === 'btc:mainnet' ? 'https://mempool.space' : 'https://mempool.space/testnet';
    return `${base}/tx/${txId}`;
  }
  const chain = network === 'stx:mainnet' ? 'mainnet' : 'testnet';
  return `https://explorer.hiro.so/txid/${txId}?chain=${chain}`;
}
