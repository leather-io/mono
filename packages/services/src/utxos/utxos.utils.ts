import { BitcoinTransaction, OwnedUtxo, Utxo, UtxoId } from '@leather.io/models';
import { sumNumbers } from '@leather.io/utils';

import { LeatherApiUtxo } from '../infrastructure/api/leather/leather-api.client';
import { MempoolDescriptorUtxo } from '../infrastructure/api/mempool/mempool-api.schema';
import {
  isOutboundTx,
  isPendingTx,
  readTxOwnedVins,
} from '../transactions/bitcoin-transactions.utils';
import { UtxoTotals } from './utxos.service';

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

export const dustSatThreshold = 500;

// TODO: Add address-type specific dust thresholds
export function isDustUtxo(utxo: Utxo) {
  return Number(utxo.value) < dustSatThreshold;
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

export function getOutboundUtxos(txs: BitcoinTransaction[], fingerprint: string): OwnedUtxo[] {
  const txMap = new Map(txs.map(tx => [tx.txid, tx]));
  return txs
    .filter(isPendingTx)
    .filter(isOutboundTx)
    .map(readTxOwnedVins)
    .flat()
    .map(vin => ({
      txid: vin.txid!,
      vout: vin.n,
      address: vin.address ?? '',
      path: vin.path ?? '',
      value: Number(vin.value),
      keyOrigin: vin.path ? getKeyOrigin(fingerprint, vin.path) : '',
      // there's a chance the page of txs doesnt include the original, to get height but because its outbound, we know it is confirmed.
      // in these cases, fallback to a default height
      height: txMap.get(vin.txid!)?.height ?? fallbackUtxoHeight,
    }));
}

export function createOwnedUtxoFromMempool(
  utxo: MempoolDescriptorUtxo,
  masterFingerprint: string
): OwnedUtxo {
  return {
    ...utxo,
    ...(utxo.status.block_height !== undefined ? { height: utxo.status.block_height } : {}),
    keyOrigin: getKeyOrigin(masterFingerprint, utxo.path),
  };
}

export function createOwnedUtxoFromLeather(
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

export function getUtxoTotals(
  accountFingerprint: string,
  totalUtxos: OwnedUtxo[],
  btcTxs: BitcoinTransaction[]
): UtxoTotals {
  const outboundUtxos = getOutboundUtxos(btcTxs, accountFingerprint);
  const unconfirmedUtxos = totalUtxos.filter(isUnconfirmedUtxo);
  const confirmedUtxos = [
    ...totalUtxos.filter(filterOutMatchesAnyUtxoId(unconfirmedUtxos)),
    ...outboundUtxos,
  ];
  const dustUtxos = confirmedUtxos.filter(isDustUtxo);
  const unspendableUtxos = selectUniqueUtxoIds([...outboundUtxos, ...dustUtxos]);
  const availableUtxos = confirmedUtxos.filter(filterOutMatchesAnyUtxoId(unspendableUtxos));
  return {
    confirmed: confirmedUtxos,
    inbound: unconfirmedUtxos,
    outbound: outboundUtxos,
    dust: dustUtxos,
    unspendable: unspendableUtxos,
    available: availableUtxos,
  };
}
