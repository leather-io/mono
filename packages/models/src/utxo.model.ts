export interface UtxoId {
  readonly txid: string;
  readonly vout: number;
}

export interface Utxo extends UtxoId {
  readonly height?: number; // no height indicates unconfirmed tx
  readonly value: number; // sats
}

export interface OwnedUtxo extends Utxo {
  readonly address: string;
  readonly path: string;
  readonly keyOrigin: string;
}
