import { useCallback } from 'react';

import { HDKey } from '@scure/bip32';

import { isUndefined } from '@leather.io/utils';

import { BestInSlotInscriptionResponse } from '../clients/best-in-slot';
import { createBestInSlotInscription } from './inscription.utils';
import { useBestInSlotGetInscriptionsInfiniteQuery } from './inscriptions-infinite.query';

interface FindInscriptionsOnUtxoArgs {
  index: number;
  inscriptions: BestInSlotInscriptionResponse[];
  txId: string;
}
export function findInscriptionsOnUtxo({ index, inscriptions, txId }: FindInscriptionsOnUtxoArgs) {
  return inscriptions?.filter(inscription => {
    const [txid, output] = inscription.satpoint.split(':');
    return `${txId}:${index.toString()}` === `${txid}:${output}`;
  });
}

export function useNumberOfInscriptionsOnUtxo({
  taprootKeychain,
  nativeSegwitAddress,
}: {
  nativeSegwitAddress: string;
  taprootKeychain: HDKey | undefined;
}) {
  const query = useBestInSlotGetInscriptionsInfiniteQuery({
    taprootKeychain,
    nativeSegwitAddress,
  });
  const inscriptions = query.data?.pages?.flatMap(page => page.inscriptions);

  return useCallback(
    (txId: string, index: number) => {
      if (isUndefined(inscriptions)) return 0;
      const foundInscriptionsOnUtxo = findInscriptionsOnUtxo({ index, inscriptions, txId });
      if (isUndefined(foundInscriptionsOnUtxo)) return 0;
      return foundInscriptionsOnUtxo?.length;
    },
    [inscriptions]
  );
}

export function useInscriptions({
  taprootKeychain,
  nativeSegwitAddress,
}: {
  nativeSegwitAddress: string;
  taprootKeychain: HDKey | undefined;
}) {
  const query = useBestInSlotGetInscriptionsInfiniteQuery({
    taprootKeychain,
    nativeSegwitAddress,
  });
  return {
    ...query,
    inscriptions:
      query.data?.pages.flatMap(page =>
        page.inscriptions.filter(Boolean).map(createBestInSlotInscription)
      ) ?? [],
  };
}

export function useInscriptionsAddressesMap({
  taprootKeychain,
  nativeSegwitAddress,
}: {
  nativeSegwitAddress: string;
  taprootKeychain: HDKey | undefined;
}) {
  const query = useBestInSlotGetInscriptionsInfiniteQuery({
    taprootKeychain,
    nativeSegwitAddress,
  });
  if (!query.data) return {};
  const addressesMapArray = query.data.pages.map(page => page.addressesMap);
  const addressesMap = addressesMapArray.reduce((acc, addressMap) => {
    return {
      ...acc,
      ...addressMap,
    };
  });

  return addressesMap;
}
