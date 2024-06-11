import { deserializeTransaction } from '@stacks/transactions';

import { useRawTransactionById } from './raw-transaction-by-id.query';

const rawTxCache = new Map();

export function useStacksRawTransaction(txid: string) {
  const { data: rawTxData, isLoading: isLoadingRawTx } = useRawTransactionById(txid);

  const match = rawTxCache.get(txid);
  // No need to fetch again
  if (match) return match;
  rawTxCache.set(txid, rawTxData?.raw_tx);
  return { isLoadingRawTx, rawTx: deserializeTransaction(rawTxData?.raw_tx ?? '') };
}
