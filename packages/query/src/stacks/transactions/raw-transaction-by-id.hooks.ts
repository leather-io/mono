import { useMemo } from 'react';

import { deserializeTransaction } from '@stacks/transactions';

import { isUndefined } from '@leather-wallet/utils';

import { useRawTransactionById } from './raw-transaction-by-id.query';

const rawTxCache = new Map();

export function useStacksRawTransaction(txid: string) {
  const { data: rawTxData, isLoading: isLoadingRawTx } = useRawTransactionById(txid);

  return useMemo(() => {
    const match = rawTxCache.get(txid);
    // No need to fetch again
    if (match) return match;
    rawTxCache.set(txid, rawTxData?.raw_tx);
    if (isUndefined(rawTxData)) return { isLoadingRawTx, rawTx: undefined };
    return { isLoadingRawTx, rawTx: deserializeTransaction(rawTxData.raw_tx) };
  }, [isLoadingRawTx, rawTxData, txid]);
}
