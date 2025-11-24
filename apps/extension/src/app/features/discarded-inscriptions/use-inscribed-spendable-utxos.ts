import { useMemo } from 'react';

import type { InscriptionAsset } from '@leather.io/models';

import { useCurrentNativeSegwitInscriptions } from '@app/query/bitcoin/ordinals/inscriptions/inscriptions.query';
import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

export function useInscribedSpendableUtxos() {
  const { hasInscriptionBeenDiscarded } = useCurrentAccountDiscardedInscriptions();

  const { data: nativeSegwitInscriptions } = useCurrentNativeSegwitInscriptions();

  return useMemo(() => {
    if (!nativeSegwitInscriptions) return [];

    const inscriptionsByUtxo = nativeSegwitInscriptions.reduce<Map<string, InscriptionAsset[]>>(
      (acc, inscription) => {
        const key = `${inscription.txid}:${inscription.output}`;
        const inscriptions = acc.get(key) ?? [];
        inscriptions.push(inscription);
        acc.set(key, inscriptions);
        return acc;
      },
      new Map()
    );

    return Array.from(inscriptionsByUtxo.entries())
      .filter(([, inscriptions]) =>
        inscriptions.every(inscription => hasInscriptionBeenDiscarded(inscription))
      )
      .map(([key]) => {
        const [txid, vout] = key.split(':');
        return { txid, vout: Number(vout) };
      });
  }, [nativeSegwitInscriptions, hasInscriptionBeenDiscarded]);
}
