import { useMemo } from 'react';

import { HDKey } from '@scure/bip32';

import { createMoney, sumNumbers } from '@leather.io/utils';

import { filterUtxosWithInscriptions } from '../address/utxos-by-address.hooks';
import { useGetTaprootUtxosByAddressQuery } from '../address/utxos-by-address.query';
import { createBestInSlotInscription } from '../ordinals/inscription.utils';
import { useBestInSlotGetInscriptionsInfiniteQuery } from '../ordinals/inscriptions-infinite.query';

const RETRIEVE_UTXO_DUST_AMOUNT = 10000;

export function useCurrentTaprootAccountUninscribedUtxos({
  taprootKeychain,
  currentAccountIndex,
  nativeSegwitAddress,
}: {
  taprootKeychain: HDKey | undefined;
  currentAccountIndex: number;
  nativeSegwitAddress: string;
}) {
  const { data: utxos = [] } = useGetTaprootUtxosByAddressQuery({
    taprootKeychain: taprootKeychain,
    currentAccountIndex,
  });

  const query = useBestInSlotGetInscriptionsInfiniteQuery({
    taprootKeychain,
    nativeSegwitAddress,
  });

  return useMemo(() => {
    const inscriptionsResponse = query.data?.pages?.flatMap(page => page.inscriptions) ?? [];

    const inscriptions = inscriptionsResponse.map(createBestInSlotInscription);

    const filteredUtxosList = utxos
      .filter(utxo => utxo.status.confirmed)
      .filter(utxo => utxo.value > RETRIEVE_UTXO_DUST_AMOUNT);

    return filteredUtxosList.filter(filterUtxosWithInscriptions(inscriptions));
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
