import { useCallback, useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { type BitcoinTx } from '@leather.io/models';
import { createBitcoinAddressTransactionsQueryConfig } from '@leather.io/queries';
import { isDefined } from '@leather.io/utils';

import { useUserSettings } from '@app/hooks/use-user-settings';
import { useCurrentAccountNativeSegwitIndexZeroPayerNullable } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

function useFilterAddressPendingTransactions() {
  return useCallback((txs: BitcoinTx[]) => txs.filter(tx => !tx.status.confirmed), []);
}

function useBitcoinPendingTransactions(addresses: string[]) {
  const filterPendingTransactions = useFilterAddressPendingTransactions();
  const settings = useUserSettings();

  return useQueries({
    queries: addresses.map(address => ({
      ...createBitcoinAddressTransactionsQueryConfig(address, settings),
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
