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
//# sourceMappingURL=utxo.d.ts.map