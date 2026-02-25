import type { BitcoinTx } from '@leather.io/models';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import type { BitcoinClient } from '../clients/bitcoin-client';

interface CreateGetBitcoinTransactionByTxidQueryOptionsArgs {
  client: BitcoinClient;
  txid: string;
}
export function createGetBitcoinTransactionByTxidQueryOptions({
  client,
  txid,
}: CreateGetBitcoinTransactionByTxidQueryOptionsArgs) {
  return {
    enabled: !!txid,
    queryKey: [BitcoinQueryPrefixes.GetTransactionByTxid, client.networkName, txid],
    async queryFn(): Promise<BitcoinTx> {
      return client.transactionsApi.getBitcoinTransaction(txid);
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  } as const;
}
