import { OwnedUtxo, Utxo, UtxoId } from '@leather.io/models';
import { sumNumbers } from '@leather.io/utils';

import {
  LeatherApiBitcoinTransaction,
  LeatherApiUtxo,
} from '../infrastructure/api/leather/leather-api.client';
import {
  isOutboundTx,
  isPendingTx,
  readTxOwnedVins,
} from '../transactions/bitcoin-transactions.utils';

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
  return (utxo: Utxo) => utxoIds.some(id => id.txid === utxo.txid && id.vout === utxo.vout);
}

export function filterOutMatchesAnyUtxoId(utxoIds: UtxoId[]) {
  return (utxo: Utxo) => !utxoIds.some(id => id.txid === utxo.txid && id.vout === utxo.vout);
}

export function utxoToId(utxo: Utxo) {
  return {
    txid: utxo.txid,
    vout: utxo.vout,
  };
}

export function isUnconfirmedUtxo(utxo: Utxo) {
  return !utxo.height;
}

export const uneconomicalSatThreshold = 10000;

export function isUneconomicalUtxo(utxo: Utxo) {
  return Number(utxo.value) < uneconomicalSatThreshold;
}

export function sumUtxoValues(utxos: Utxo[]) {
  return sumNumbers(utxos.map(utxo => utxo.value));
}

export function selectUniqueUtxoIds<T extends UtxoId>(ids: T[]) {
  return ids.filter(
    (utxo, index, self) =>
      index === self.findIndex(u => u.txid === utxo.txid && u.vout === utxo.vout)
  );
}

export const fallbackUtxoHeight = 800_000;

export function getOutboundUtxos(
  txs: LeatherApiBitcoinTransaction[],
  fingerprint: string
): OwnedUtxo[] {
  const txMap = new Map(txs.map(tx => [tx.txid, tx]));
  return txs
    .filter(isPendingTx)
    .filter(isOutboundTx)
    .map(readTxOwnedVins)
    .flat()
    .map(vin => ({
      txid: vin.txid,
      vout: vin.n,
      address: vin.address ?? '',
      path: vin.path ?? '',
      value: Number(vin.value),
      keyOrigin: vin.path ? getKeyOrigin(fingerprint, vin.path) : '',
      // there's a chance the page of txs doesnt include the original, to get height but because its outbound, we know it is confirmed.
      // in these cases, fallback to a default height
      height: txMap.get(vin.txid)?.height ?? fallbackUtxoHeight,
    }));
}

export function mapLeatherApiUtxoToOwnedUtxo(
  utxo: LeatherApiUtxo,
  masterFingerprint: string
): OwnedUtxo {
  return {
    ...utxo,
    value: Number(utxo.value),
    keyOrigin: getKeyOrigin(masterFingerprint, utxo.path),
  };
}

export function getKeyOrigin(fingerprint: string, path: string) {
  return `${fingerprint}/${path.replace('m/', '')}`;
}
