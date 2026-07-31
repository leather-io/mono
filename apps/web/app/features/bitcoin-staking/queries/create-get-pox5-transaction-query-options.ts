import { Pox5TxOutcome, getPox5TxOutcome } from '../transactions/pox5-tx-status';

interface Pox5TransactionReader {
  getTransactionById(txid: string, signal: AbortSignal): Promise<{ tx_status: string }>;
}

interface CreateGetPox5TransactionQueryOptionsArgs {
  txId: string | null;
  client: Pox5TransactionReader;
}

export function createGetPox5TransactionQueryOptions({
  txId,
  client,
}: CreateGetPox5TransactionQueryOptionsArgs) {
  return {
    queryKey: ['pox5-transaction', txId],
    enabled: !!txId,
    gcTime: 0,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn({ signal }: { signal: AbortSignal }): Promise<Pox5TxOutcome | null> {
      if (!txId) return null;
      try {
        const transaction = await client.getTransactionById(txId, signal);
        return getPox5TxOutcome(transaction.tx_status);
      } catch {
        return null;
      }
    },
  };
}
