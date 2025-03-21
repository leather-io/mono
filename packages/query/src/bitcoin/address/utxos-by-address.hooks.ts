import { Inscription } from '@leather.io/models';

import { RunesOutputsByAddress } from '../clients/best-in-slot';

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
