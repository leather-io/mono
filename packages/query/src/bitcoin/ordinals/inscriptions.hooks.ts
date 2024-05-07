import { useCallback } from 'react';

import { isUndefined } from '@leather-wallet/utils';
import { HDKey } from '@scure/bip32';

import { InscriptionResponse } from '../../../types/inscription';
import { useGetInscriptionsInfiniteQuery } from './inscriptions.query';

interface FindInscriptionsOnUtxoArgs {
  index: number;
  inscriptions: InscriptionResponse[];
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
