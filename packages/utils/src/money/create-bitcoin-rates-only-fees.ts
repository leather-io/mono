import type { TransactionFees } from '@leather.io/models';

import { createMoney } from './create-money';

interface BitcoinFeeRatesInput {
  low: { rate: number };
  standard: { rate: number };
  high: { rate: number };
}

function ratesOnlyFeeQuote(rate: number) {
  return {
    type: 'bitcoinFeeRate' as const,
    value: createMoney(0, 'BTC'),
    rate,
    rateUnit: 'sats/vB' as const,
    estimatedTxSize: 0,
    sizeUnit: 'vB' as const,
  };
}

export function createBitcoinRatesOnlyFees(rates: BitcoinFeeRatesInput): TransactionFees {
  return {
    chain: 'bitcoin',
    options: {
      low: ratesOnlyFeeQuote(rates.low.rate),
      standard: ratesOnlyFeeQuote(rates.standard.rate),
      high: ratesOnlyFeeQuote(rates.high.rate),
    },
  };
}
