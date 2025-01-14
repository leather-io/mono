import { BitcoinAccountIdentifier } from '../shared/bitcoin.types';

export interface BitcoinTransactionsService {
  getOutboundTransactions(account: BitcoinAccountIdentifier, signal?: AbortSignal): Promise<any[]>;
}

// TODO: WIP - Requires new Leather API Tx endpoint leveraging xpub lookups
export function createBitcoinTransactionsService(): BitcoinTransactionsService {
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async function getOutboundTransactions(account: BitcoinAccountIdentifier, signal?: AbortSignal) {
    return [];
  }
  return {
    getOutboundTransactions,
  };
}
