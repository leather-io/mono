import { FeeRateTransactionFeeQuote, Money } from '@leather.io/models';

export function createBitcoinTransactionFeeQuote(
  fee: Money,
  feeRate: number,
  txVBytes: number
): FeeRateTransactionFeeQuote {
  return {
    type: 'feeRate',
    value: fee,
    rate: feeRate,
    rateUnit: 'sats/vB',
    estimatedTxSize: txVBytes,
    sizeUnit: 'vB',
  };
}
