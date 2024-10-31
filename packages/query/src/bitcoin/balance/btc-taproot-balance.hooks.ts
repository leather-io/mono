import { UseQueryResult } from '@tanstack/react-query';

import { Inscription } from '@leather.io/models';
import { createMoney, isDefined, sumNumbers } from '@leather.io/utils';

import { UtxoWithDerivationPath } from '../../../types/utxo';
import { filterUtxosWithInscriptions } from '../address/utxos-by-address.hooks';
import { BestInSlotInscriptionByXpubResponse } from '../clients/best-in-slot';
import { createBestInSlotInscription } from '../ordinals/inscription.utils';
import { findInscriptionsOnUtxo } from '../ordinals/inscriptions.hooks';

const RETRIEVE_UTXO_DUST_AMOUNT = 10000;

export function filterUninscribedUtxosToRecoverFromTaproot(
  utxos: UtxoWithDerivationPath[],
  inscriptions: Inscription[]
) {
  const filteredUtxosList = utxos
    .filter(utxo => utxo.status.confirmed)
    .filter(utxo => utxo.value > RETRIEVE_UTXO_DUST_AMOUNT);

  return filteredUtxosList.filter(filterUtxosWithInscriptions(inscriptions));
}

export function utxosToBalance(utxos: UtxoWithDerivationPath[]) {
  return createMoney(sumNumbers(utxos.map(utxo => Number(utxo.value))), 'BTC');
}

export function combineInscriptionResults(
  queries: UseQueryResult<BestInSlotInscriptionByXpubResponse, Error>[]
) {
  if (queries.some(resp => resp.isLoading)) return { queries, isLoading: true } as const;

  const inscriptions = queries
    .map(resp => resp.data?.data)
    .flatMap(inscription => inscription)
    .filter(isDefined)
    .map(inscription => createBestInSlotInscription(inscription));

  return { queries, inscriptions, isLoading: false } as const;
}

export function createNumberOfInscriptionsFn(
  queryResult: ReturnType<typeof combineInscriptionResults>
) {
  return (txid: string, vout: number) => {
    if (queryResult.isLoading) return 0;
    return findInscriptionsOnUtxo({
      inscriptions: queryResult.inscriptions,
      txId: txid,
      index: vout,
    }).length;
  };
}
