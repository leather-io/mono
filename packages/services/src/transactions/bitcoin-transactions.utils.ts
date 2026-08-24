import { BitcoinTransaction } from '@leather.io/models';

import { LeatherApiBitcoinTransaction } from '../infrastructure/api/leather/leather-api.client';
import {
  MempoolDescriptorFields,
  MempoolTransaction,
} from '../infrastructure/api/mempool/mempool-api.schema';

export function isPendingTx(bitcoinTx: LeatherApiBitcoinTransaction) {
  return bitcoinTx.height === undefined;
}

export function isOutboundTx(bitcoinTx: LeatherApiBitcoinTransaction) {
  return bitcoinTx.vin.some(vin => vin.owned);
}

export function readTxOwnedVins(bitcoinTx: LeatherApiBitcoinTransaction) {
  return bitcoinTx.vin.filter(vin => vin.owned);
}

export function readTxOwnedVouts(bitcoinTx: LeatherApiBitcoinTransaction) {
  return bitcoinTx.vout.filter(vout => vout.owned);
}

export function createBitcoinTransactionFromLeather(
  tx: LeatherApiBitcoinTransaction
): BitcoinTransaction {
  return {
    txid: tx.txid,
    height: tx.height,
    time: tx.time,
    vin: tx.vin?.map(vin => ({
      n: vin.n,
      txid: vin.txid,
      owned: vin.owned,
      address: vin.address,
      path: vin.path,
      value: vin.value,
    })),
    vout: tx.vout?.map(vout => ({
      n: vout.n,
      owned: vout.owned,
      address: vout.address,
      path: vout.path,
      value: vout.value,
    })),
  };
}

export function createBitcoinTransactionFromMempool(
  tx: MempoolTransaction & Partial<MempoolDescriptorFields>
): BitcoinTransaction {
  const ownedAddress = tx.address;

  function ownership(address: string | undefined) {
    if (ownedAddress === undefined || address !== ownedAddress) return {};
    return { owned: true, ...(tx.path !== undefined ? { path: tx.path } : {}) };
  }

  return {
    txid: tx.txid,
    ...(tx.status.block_height !== undefined ? { height: tx.status.block_height } : {}),
    ...(tx.status.block_time !== undefined ? { time: tx.status.block_time } : {}),
    vin: tx.vin.map(vin => ({
      txid: vin.txid,
      n: vin.vout,
      address: vin.prevout?.scriptpubkey_address ?? '',
      ...ownership(vin.prevout?.scriptpubkey_address),
      value: vin.prevout?.value?.toString() ?? '0',
    })),
    vout: tx.vout.map((vout, i) => ({
      n: i,
      address: vout.scriptpubkey_address,
      ...ownership(vout.scriptpubkey_address),
      value: vout.value?.toString() ?? '0',
    })),
  };
}
