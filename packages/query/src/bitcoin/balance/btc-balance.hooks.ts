import { useMemo } from 'react';

import BigNumber from 'bignumber.js';

import { BitcoinAddress } from '@leather.io/models';
import { createMoney, isUndefined, sumNumbers } from '@leather.io/utils';

import { useNativeSegwitUtxosByAddress } from '../address/utxos-by-address.hooks';
import { useRunesEnabled } from '../runes/runes.hooks';

export function useGetBitcoinBalanceByAddress(address: BitcoinAddress) {
  const runesEnabled = useRunesEnabled();

  const {
    data: utxos,
    isLoading,
    filteredUtxosQuery,
  } = useNativeSegwitUtxosByAddress({
    address,
    filterInscriptionUtxos: true,
    filterPendingTxsUtxos: true,
    filterRunesUtxos: runesEnabled,
  });

  const balance = useMemo(() => {
    if (isUndefined(utxos)) return createMoney(new BigNumber(0), 'BTC');
    return createMoney(sumNumbers(utxos.map(utxo => utxo.value)), 'BTC');
  }, [utxos]);

  return {
    balance,
    isLoading,
    isFetching: filteredUtxosQuery.isFetching,
  };
}
