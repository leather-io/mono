import { useMemo } from 'react';

import { createMoney } from '@leather-wallet/models';
import { sumNumbers } from '@leather-wallet/utils';
import { HDKey } from '@scure/bip32';

import { filterUtxosWithInscriptions } from '../address/utxos-by-address.hooks';
import { useTaprootAccountUtxosQuery } from '../address/utxos-by-address.query';
import { UtxoWithDerivationPath } from '../bitcoin-client';
import { useGetInscriptionsInfiniteQuery } from '../ordinals/inscriptions.query';

export function useCurrentTaprootAccountUninscribedUtxos({
  taprootKeychain,
  currentAccountIndex,
  nativeSegwitAddress,
}: {
  taprootKeychain: HDKey | undefined;
  currentAccountIndex: number;
  nativeSegwitAddress: string;
}) {
  const { data: utxos = [] } = useTaprootAccountUtxosQuery({
    taprootKeychain,
    currentAccountIndex,
  });

  const query = useGetInscriptionsInfiniteQuery({ taprootKeychain, nativeSegwitAddress });

  return useMemo(() => {
    const inscriptions = query.data?.pages?.flatMap(page => page.inscriptions) ?? [];
    return filterUtxosWithInscriptions(
      inscriptions,
      utxos.filter(utxo => utxo.status.confirmed)
    ) as UtxoWithDerivationPath[];
  }, [query.data?.pages, utxos]);
}

export function useCurrentTaprootAccountBalance({
  taprootKeychain,
  currentAccountIndex,
  nativeSegwitAddress,
}: {
  taprootKeychain: HDKey | undefined;
  currentAccountIndex: number;
  nativeSegwitAddress: string;
}) {
  const uninscribedUtxos = useCurrentTaprootAccountUninscribedUtxos({
    taprootKeychain,
    currentAccountIndex,
    nativeSegwitAddress,
  });

  return useMemo(
    () => createMoney(sumNumbers(uninscribedUtxos.map(utxo => Number(utxo.value))), 'BTC'),
    [uninscribedUtxos]
  );
}
