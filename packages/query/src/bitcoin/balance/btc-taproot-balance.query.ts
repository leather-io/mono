import type { UseQueryResult } from '@tanstack/react-query';

import { isDefined } from '@leather.io/utils';

import { BestInSlotInscriptionByXpubResponse } from '../clients/best-in-slot';
import { createBestInSlotInscription } from '../ordinals/inscription.utils';
import { findInscriptionsOnUtxo } from '../ordinals/ordinals.utils';

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
