export interface Utxo {
  address: string;
  confirmations: number;
  height?: number;
  path: string;
  txid: string;
  value: string;
  vout: number;
}
