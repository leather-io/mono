import { BitcoinTransactionFeeQuote, Money } from '@leather.io/models';

export function createBitcoinTransactionFeeQuote(
  fee: Money,
  feeRate: number,
  txVBytes: number
): BitcoinTransactionFeeQuote {
  return {
    type: 'bitcoinFeeRate',
    value: fee,
    rate: feeRate,
    rateUnit: 'sats/vB',
    estimatedTxSize: txVBytes,
    sizeUnit: 'vB',
  };
}
