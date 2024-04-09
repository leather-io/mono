import { useMemo } from 'react';

import { createMoney, isUndefined, sumNumbers } from '@leather-wallet/utils';
import BigNumber from 'bignumber.js';

import { useNativeSegwitUtxosByAddress } from '../address/utxos-by-address.hooks';

export function useGetBitcoinBalanceByAddress(address: string) {
  const { data: utxos } = useNativeSegwitUtxosByAddress({
    address,
    filterInscriptionUtxos: true,
    filterPendingTxsUtxos: true,
  });

  return useMemo(() => {
    if (isUndefined(utxos)) return createMoney(new BigNumber(0), 'BTC');
    return createMoney(sumNumbers(utxos.map(utxo => utxo.value)), 'BTC');
  }, [utxos]);
}
