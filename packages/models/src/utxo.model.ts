export interface UtxoId {
  txid: string;
  vout: number;
}

export interface Utxo extends UtxoId {
  height?: number;
  confirmations?: number;
  address: string;
  path: string;
  value: string;
}
