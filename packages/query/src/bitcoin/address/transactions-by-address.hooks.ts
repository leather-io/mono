import { useCallback } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import type { BitcoinTx } from '@leather.io/models';
import { sumNumbers } from '@leather.io/utils';

import { useBitcoinClient } from '../clients/bitcoin-client';
import { createGetBitcoinTransactionsByAddressQueryOptions } from './transactions-by-address.query';

function useFilterAddressPendingTransactions() {
  return useCallback((txs: BitcoinTx[]) => txs.filter(tx => !tx.status.confirmed), []);
}

export function useBitcoinPendingTransactions(addresses: string[]) {
  const filterPendingTransactions = useFilterAddressPendingTransactions();
  const client = useBitcoinClient();

  return useQueries({
    queries: addresses.map(address => {
      return {
        ...createGetBitcoinTransactionsByAddressQueryOptions({ address, client }),
        select: (resp: BitcoinTx[]) => filterPendingTransactions(resp),
      };
    }),
  });
}

export function useBitcoinPendingTransactionsInputs(address: string) {
  const filterPendingTransactions = useFilterAddressPendingTransactions();
  const client = useBitcoinClient();

  return useQuery({
    ...createGetBitcoinTransactionsByAddressQueryOptions({ address, client }),
    select: (resp: BitcoinTx[]) =>
      filterPendingTransactions(resp).flatMap(tx => tx.vin.map(input => input)),
  });
}

export function calculateOutboundPendingTxsValue(pendingTxs: BitcoinTx[], address: string) {
  // sum all inputs
  const sumInputs = sumNumbers(pendingTxs.flatMap(tx => tx.vin.map(input => input.prevout.value)));

  // get all outputs that are sent back to the address
  const returnedOutputChangeValues = pendingTxs
    .flatMap(tx => tx.vout.map(output => output))
    .filter(v => v.scriptpubkey_address === address)
    .flatMap(output => output.value);

  // sum all filtered outputs
  const sumOutputs = sumNumbers(returnedOutputChangeValues);

  return sumInputs.minus(sumOutputs).toNumber();
}
