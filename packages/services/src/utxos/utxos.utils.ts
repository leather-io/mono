import { Utxo, UtxoId } from '@leather.io/models';
import { sumNumbers } from '@leather.io/utils';

export function getUtxoIdFromSatpoint(satpoint: string) {
  const splits = satpoint?.split(':');
  if (!splits || splits.length !== 3) return; // invalid satpoint
  return {
    txid: splits[0],
    vout: Number(splits[1]),
  };
}

export function getUtxoIdFromOutpoint(outpoint: string) {
  const splits = outpoint?.split(':');
  if (!splits || splits.length !== 2 || isNaN(Number(splits[1]))) return; // invalid outpoint
  return {
    txid: splits[0],
    vout: Number(splits[1]),
  };
}

export function filterMatchesAnyUtxoId(utxoIds: UtxoId[]) {
  return (utxo: Utxo): utxo is Utxo =>
    utxoIds.some(id => id.txid === utxo.txid && id.vout === utxo.vout);
}

export function filterOutMatchesAnyUtxoId(utxoIds: UtxoId[]) {
  return (utxo: Utxo): utxo is Utxo =>
    !utxoIds.some(id => id.txid === utxo.txid && id.vout === utxo.vout);
}

export function utxoToId(utxo: Utxo) {
  return {
    txid: utxo.txid,
    vout: utxo.vout,
  };
}

export function isInboundUtxo(utxo: Utxo) {
  return !utxo.height;
}

export const uneconomicalSatThreshold = 10000;

export function isUneconomicalUtxo(utxo: any): utxo is Utxo {
  return Number(utxo.value) < uneconomicalSatThreshold;
}

export function sumUtxoValues(utxos: Utxo[]) {
  return sumNumbers(utxos.map(utxo => Number(utxo.value)));
}

export function selectUniqueUtxoIds<T extends UtxoId>(ids: T[]) {
  return ids.filter(
    (utxo, index, self) =>
      index === self.findIndex(u => u.txid === utxo.txid && u.vout === utxo.vout)
  );
}
