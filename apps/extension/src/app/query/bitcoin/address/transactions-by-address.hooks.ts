import { useCallback, useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { BitcoinTx } from '@leather.io/models';
import { createGetBitcoinTransactionsByAddressQueryOptions } from '@leather.io/query';
import { isDefined } from '@leather.io/utils';

import { useCurrentAccountNativeSegwitIndexZeroPayerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

import { useBitcoinClient } from '../clients/bitcoin-client';

function useFilterAddressPendingTransactions() {
  return useCallback((txs: BitcoinTx[]) => txs.filter(tx => !tx.status.confirmed), []);
}

function useBitcoinPendingTransactions(addresses: string[]) {
  const filterPendingTransactions = useFilterAddressPendingTransactions();
  const client = useBitcoinClient();

  return useQueries({
    queries: addresses.map(address => ({
      ...createGetBitcoinTransactionsByAddressQueryOptions({ address, client }),
      select: (resp: BitcoinTx[]) => filterPendingTransactions(resp),
    })),
  });
}

function useCurrentBitcoinPayerAddresses() {
  const nativeSegwitPayer = useCurrentAccountNativeSegwitIndexZeroPayerNullable();
  const taprootPayer = useCurrentAccountTaprootPayer();

  return useMemo(
    () =>
      [
        nativeSegwitPayer?.address,
        taprootPayer?.({ changeIndex: 0, addressIndex: 0 })?.address,
      ].filter(isDefined),
    [nativeSegwitPayer, taprootPayer]
  );
}

export function usePendingBitcoinTxByTxid(txid: string) {
  const addresses = useCurrentBitcoinPayerAddresses();
  const results = useBitcoinPendingTransactions(addresses);

  return results.flatMap(result => result.data ?? []).find(tx => tx.txid === txid);
}
