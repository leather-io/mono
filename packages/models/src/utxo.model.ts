export interface UtxoId {
  txid: string;
  vout: number;
}

export interface Utxo extends UtxoId {
  height?: number; // no height indicates unconfirmed tx
  address: string;
  path: string;
  value: string;
}
