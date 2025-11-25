import { useMemo } from 'react';

import { useCurrentNativeSegwitInscriptions } from '@app/query/bitcoin/ordinals/inscriptions/inscriptions.query';
import { useCurrentNativeSegwitInscribedUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

export function useInscribedSpendableUtxos() {
  const { hasInscriptionBeenDiscarded } = useCurrentAccountDiscardedInscriptions();

  const nativeSegwitInscriptions = useCurrentNativeSegwitInscriptions();

  // Utxos but don't filter the inscribed ones
  const { utxos } = useCurrentNativeSegwitInscribedUtxos();

  return useMemo(() => {
    if (!utxos || !nativeSegwitInscriptions.value) return [];

    // Preformatting utxos so that inscriptions are declared as an object
    // property aids the following filter logic
    const utxosFormatted = utxos.map(utxo => ({
      ...utxo,
      inscriptions: nativeSegwitInscriptions.value.filter(
        inscription => inscription.txid === utxo.txid && Number(inscription.output) === utxo.vout
      ),
    }));

    const utxosThatCanBeSpentBecauseAllUtxosInsideWereDiscarded = utxosFormatted
      // If there are no inscriptions they're not being filtered and we don't care about them
      .filter(utxo => utxo.inscriptions.length > 0)
      // For a given utxo with inscriptions, check that all inscriptions in it
      // have been discarded. This check ensures we don't spend a utxo if only
      // one of potentially many have been discarded
      .filter(utxo =>
        utxo.inscriptions.every(inscription => hasInscriptionBeenDiscarded(inscription))
      );

    return utxosThatCanBeSpentBecauseAllUtxosInsideWereDiscarded;
  }, [utxos, nativeSegwitInscriptions, hasInscriptionBeenDiscarded]);
}
