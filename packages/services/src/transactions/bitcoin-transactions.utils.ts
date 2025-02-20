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
