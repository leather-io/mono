export interface UtxoId {
  txid: string;
  vout: number;
}

export interface Utxo extends UtxoId {
  height?: number; // no height indicates unconfirmed tx
  value: number; // sats
}

export interface OwnedUtxo extends Utxo {
  address: string;
  path: string;
  keyOrigin: string;
}
