import { useCallback } from 'react';

import { HDKey } from '@scure/bip32';

import { isUndefined } from '@leather-wallet/utils';

import { InscriptionResponseHiro } from '../../../types/inscription';
import { createInscriptionHiro } from './inscription.utils';
import { useGetInscriptionsInfiniteQuery } from './inscriptions.query';

interface FindInscriptionsOnUtxoArgs {
  index: number;
  inscriptions: InscriptionResponseHiro[];
  txId: string;
}
export function findInscriptionsOnUtxo({ index, inscriptions, txId }: FindInscriptionsOnUtxoArgs) {
  return inscriptions?.filter(inscription => {
    return `${txId}:${index.toString()}` === inscription.output;
  });
}

export function useNumberOfInscriptionsOnUtxo({
  taprootKeychain,
  nativeSegwitAddress,
}: {
  nativeSegwitAddress: string;
  taprootKeychain: HDKey | undefined;
}) {
  const query = useGetInscriptionsInfiniteQuery({
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
  const query = useGetInscriptionsInfiniteQuery({
    taprootKeychain,
    nativeSegwitAddress,
  });
  return {
    ...query,
    inscriptions:
      query.data?.pages.flatMap(page => page.inscriptions.map(createInscriptionHiro)) ?? [],
  };
}

export function useInscriptionsAddressesMap({
  taprootKeychain,
  nativeSegwitAddress,
}: {
  nativeSegwitAddress: string;
  taprootKeychain: HDKey | undefined;
}) {
  const query = useGetInscriptionsInfiniteQuery({
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
