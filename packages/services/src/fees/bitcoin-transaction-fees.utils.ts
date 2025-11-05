import {
  BitcoinTransactionFeeQuote,
  CoinSelectionOutput,
  Money,
  OwnedUtxo,
} from '@leather.io/models';

export function createBitcoinTransactionFeeQuote(
  fee: Money,
  feeRate: number,
  txVBytes: number,
  inputs: OwnedUtxo[],
  outputs: CoinSelectionOutput[]
): BitcoinTransactionFeeQuote {
  return {
    type: 'bitcoinFeeRate',
    value: fee,
    rate: feeRate,
    rateUnit: 'sats/vB',
    estimatedTxSize: txVBytes,
    sizeUnit: 'vB',
    inputs,
    outputs,
  };
}
