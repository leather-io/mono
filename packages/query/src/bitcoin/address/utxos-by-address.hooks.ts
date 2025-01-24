import { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Inscription, UtxoResponseItem } from '@leather.io/models';

import { RunesOutputsByAddress } from '../clients/best-in-slot';
import { useBitcoinClient } from '../clients/bitcoin-client';
import { createBestInSlotInscription } from '../ordinals/inscription.utils';
import { useGetInscriptionsByAddressQuery } from '../ordinals/inscriptions.query';
import { useRunesEnabled, useRunesOutputsByAddress } from '../runes/runes.hooks';
import { useBitcoinPendingTransactionsInputs } from './transactions-by-address.hooks';
import { createGetUtxosByAddressQueryOptions } from './utxos-by-address.query';

interface UtxoIdentifier {
  txid: string;
  vout: number;
}

export function filterUtxosWithInscriptions(inscriptions: Inscription[]) {
  return <T extends UtxoIdentifier>(utxo: T) => {
    return !inscriptions.some(
      inscription =>
        `${utxo.txid}:${utxo.vout.toString()}` === `${inscription.txid}:${inscription.output}`
    );
  };
}

export function filterUtxosWithRunes(runes: RunesOutputsByAddress[]) {
  return <T extends UtxoIdentifier>(utxo: T) => {
    return !runes.some(rune => rune.output === `${utxo.txid}:${utxo.vout}`);
  };
}

const defaultArgs = {
  filterInscriptionUtxos: true,
  filterPendingTxsUtxos: true,
  filterRunesUtxos: true,
};

/**
 * Warning: ⚠️ To avoid spending inscriptions, when using UTXOs
 * we set `filterInscriptionUtxos` and `filterPendingTxsUtxos` to true
 */
export function useCurrentNativeSegwitUtxos(nativeSegwitAddress: string, args = defaultArgs) {
  const { filterInscriptionUtxos, filterPendingTxsUtxos, filterRunesUtxos } = args;

  return useNativeSegwitUtxosByAddress({
    address: nativeSegwitAddress,
    filterInscriptionUtxos,
    filterPendingTxsUtxos,
    filterRunesUtxos,
  });
}

interface UseFilterUtxosByAddressArgs {
  address: string;
  filterInscriptionUtxos: boolean;
  filterPendingTxsUtxos: boolean;
  filterRunesUtxos: boolean;
}

type FilterUtxoFunctionType = (utxos: UtxoResponseItem[]) => UtxoResponseItem[];

function useUtxosByAddressQuery(address: string) {
  const client = useBitcoinClient();

  return useQuery(createGetUtxosByAddressQueryOptions({ address, client }));
}

export function useNativeSegwitUtxosByAddress({
  address,
  filterInscriptionUtxos,
  filterPendingTxsUtxos,
  filterRunesUtxos,
}: UseFilterUtxosByAddressArgs) {
  const client = useBitcoinClient();

  const initialUtxosQuery = useUtxosByAddressQuery(address);

  const { filterOutInscriptions, isLoadingInscriptions } = useFilterInscriptionsByAddress(address);
  const { filterOutPendingTxsUtxos, isLoading: isLoadingPendingTxs } =
    useFilterPendingUtxosByAddress(address);
  const { filterOutRunesUtxos, isLoadingRunesData } = useFilterRuneUtxosByAddress(address);

  const filteredUtxosQuery = useQuery({
    ...createGetUtxosByAddressQueryOptions({ address, client }),
    enabled: !!initialUtxosQuery.data, // Enable filtering only after initial UTXOs are fetched
    select(utxos) {
      const filters = [];
      if (filterPendingTxsUtxos) {
        filters.push(filterOutPendingTxsUtxos);
      }

      if (filterInscriptionUtxos) {
        filters.push(filterOutInscriptions);
      }

      if (filterRunesUtxos) {
        filters.push(filterOutRunesUtxos);
      }

      return filters.reduce(
        (filteredUtxos: any, filterFunc: FilterUtxoFunctionType) => filterFunc(filteredUtxos),
        utxos
      );
    },
  });

  return {
    initialUtxosQuery,
    filteredUtxosQuery,
    data: filteredUtxosQuery.data || initialUtxosQuery.data,
    isLoading: initialUtxosQuery.isLoading,
    isLoadingAllData:
      initialUtxosQuery.isLoading ||
      isLoadingInscriptions ||
      isLoadingPendingTxs ||
      isLoadingRunesData,
    isLoadingAdditionalData: isLoadingInscriptions || isLoadingPendingTxs || isLoadingRunesData,
  };
}

function useFilterInscriptionsByAddress(address: string) {
  const {
    data: inscriptionsList,
    hasNextPage: hasMoreInscriptionsToLoad,
    isLoading: isLoadingInscriptions,
  } = useGetInscriptionsByAddressQuery(address);

  const filterOutInscriptions = useCallback(
    (utxos: UtxoResponseItem[]) => {
      const inscriptionResponses = inscriptionsList?.pages.flatMap(page => page.data) ?? [];
      const inscriptions = inscriptionResponses.map(createBestInSlotInscription);
      return utxos.filter(filterUtxosWithInscriptions(inscriptions));
    },
    [inscriptionsList?.pages]
  );

  return {
    filterOutInscriptions,
    isLoadingInscriptions: hasMoreInscriptionsToLoad || isLoadingInscriptions,
  };
}

function useFilterRuneUtxosByAddress(address: string) {
  // TO-DO what if data is undefined?
  const { data = [], isLoading } = useRunesOutputsByAddress(address);
  const runesEnabled = useRunesEnabled();

  const filterOutRunesUtxos = useCallback(
    (utxos: UtxoResponseItem[]) => {
      // If Runes are not enabled, return all utxos
      if (!runesEnabled) {
        return utxos;
      }

      return utxos.filter(filterUtxosWithRunes(data));
    },
    [data, runesEnabled]
  );

  return {
    filterOutRunesUtxos,
    isLoadingRunesData: isLoading,
  };
}

function useFilterPendingUtxosByAddress(address: string) {
  const { data: pendingInputs = [], isLoading } = useBitcoinPendingTransactionsInputs(address);

  const filterOutPendingTxsUtxos = useCallback(
    (utxos: UtxoResponseItem[]) => {
      return utxos.filter(
        utxo =>
          !pendingInputs.find(
            input => input.prevout.scriptpubkey_address === address && input.txid === utxo.txid
          )
      );
    },
    [address, pendingInputs]
  );

  return {
    filterOutPendingTxsUtxos,
    isLoading,
  };
}
