import { BitcoinTransaction } from '@leather.io/models';

import { LeatherApiBitcoinTransaction } from '../infrastructure/api/leather/leather-api.client';

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

export function createBitcoinTransaction(tx: LeatherApiBitcoinTransaction): BitcoinTransaction {
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
