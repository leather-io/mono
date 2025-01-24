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

export interface UtxoResponseItem {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
  value: number;
}

export interface UtxoWithDerivationPath extends UtxoResponseItem {
  derivationPath: string;
}
