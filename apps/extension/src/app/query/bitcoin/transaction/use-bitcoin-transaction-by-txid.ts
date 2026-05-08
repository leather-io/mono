import { useQuery } from '@tanstack/react-query';

import type { BitcoinTx } from '@leather.io/models';
import { createGetBitcoinTransactionByTxidQueryOptions } from '@leather.io/query';

import { useBitcoinClient } from '../clients/bitcoin-client';

export function useBitcoinTransactionByTxid(txid: string) {
  const client = useBitcoinClient();
  return useQuery<BitcoinTx>(createGetBitcoinTransactionByTxidQueryOptions({ client, txid }));
}
