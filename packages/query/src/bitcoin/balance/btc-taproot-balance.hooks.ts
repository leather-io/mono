import { useMemo } from 'react';

import { HDKey } from '@scure/bip32';

import { createMoney, sumNumbers } from '@leather-wallet/utils';

import { UtxoWithDerivationPath } from '../../../types/utxo';
import { filterUtxosWithInscriptions } from '../address/utxos-by-address.hooks';
import { useTaprootAccountUtxosQuery } from '../address/utxos-by-address.query';
import { createInscriptionHiro } from '../ordinals/inscription.utils';
import { useGetInscriptionsInfiniteQuery } from '../ordinals/inscriptions.query';

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
  const { data: utxos = [] } = useTaprootAccountUtxosQuery({
    taprootKeychain: taprootKeychain,
    currentAccountIndex,
  });

  const query = useGetInscriptionsInfiniteQuery({
    taprootKeychain,
    nativeSegwitAddress,
  });

  return useMemo(() => {
    const inscriptionsResponse = query.data?.pages?.flatMap(page => page.inscriptions) ?? [];

    const inscriptions = inscriptionsResponse.map(createInscriptionHiro);

    const filteredUtxosList = utxos
      .filter(utxo => utxo.status.confirmed)
      .filter(utxo => utxo.value > RETRIEVE_UTXO_DUST_AMOUNT);

    return filterUtxosWithInscriptions(inscriptions, filteredUtxosList) as UtxoWithDerivationPath[];
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
