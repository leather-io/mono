import { LeatherApiUtxo } from '../infrastructure/api/leather/leather-api.client';

export const uneconomicalSatThreshold = 10000;

export function hasUneconomicalBalance(utxo: LeatherApiUtxo) {
  return Number(utxo.value) < uneconomicalSatThreshold;
}

export function removeExistingUtxos(
  candidateUtxos: LeatherApiUtxo[],
  existingUtxos: LeatherApiUtxo[]
) {
  const existingUtxoIds = new Set(existingUtxos.map(utxo => `${utxo.txid}:${utxo.vout}`));

  return candidateUtxos.filter(utxo => !existingUtxoIds.has(`${utxo.txid}:${utxo.vout}`));
}
