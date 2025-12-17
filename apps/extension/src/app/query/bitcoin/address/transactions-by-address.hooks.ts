import { useCallback } from 'react';

import { useQueries } from '@tanstack/react-query';

import { BitcoinTx } from '@leather.io/models';
import { createGetBitcoinTransactionsByAddressQueryOptions } from '@leather.io/query';
import { uniqueArray } from '@leather.io/utils';

import { useBitcoinClient } from '../clients/bitcoin-client';

function useFilterAddressPendingTransactions() {
  return useCallback((txs: BitcoinTx[]) => txs.filter(tx => !tx.status.confirmed), []);
}

export function useBitcoinPendingTransactions(addresses: string[]) {
  const filterPendingTransactions = useFilterAddressPendingTransactions();
  const client = useBitcoinClient();
  const uniqueAddresses = uniqueArray(addresses);

  return useQueries({
    queries: uniqueAddresses.map(address => ({
      ...createGetBitcoinTransactionsByAddressQueryOptions({ address, client }),
      select: (resp: BitcoinTx[]) => filterPendingTransactions(resp),
    })),
  });
}
