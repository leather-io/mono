import type { StacksTransactionWire } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import {
  FeeCalculationTypes,
  type Fees,
  type StacksTransactionFeeQuote,
  type TransactionFeeQuote,
} from '@leather.io/models';
import { getStacksTransactionFeesService } from '@leather.io/services';

function assertIsStacksFeeRateQuote(
  quote: TransactionFeeQuote
): asserts quote is StacksTransactionFeeQuote {
  if (quote.type !== 'stacksFeeRate') {
    throw new Error(`Unexpected fee quote type for Stacks transaction: ${quote.type}`);
  }
}

export function useCalculateStacksTxFees(unsignedTx?: StacksTransactionWire) {
  return useQuery<Fees>({
    enabled: !!unsignedTx,
    queryKey: ['stacks-tx-fees', unsignedTx] as const,
    queryFn: async ({ signal }) => {
      if (!unsignedTx) throw new Error('Stacks tx fees query was called without unsigned tx');

      const service = getStacksTransactionFeesService();
      const res = await service.getStacksTransactionFees(unsignedTx, signal);
      const { low, standard, high } = res.options;

      assertIsStacksFeeRateQuote(low);
      assertIsStacksFeeRateQuote(standard);
      assertIsStacksFeeRateQuote(high);

      return {
        blockchain: 'stacks',
        calculation: FeeCalculationTypes.Api,
        estimates: [
          { fee: low.value, feeRate: low.rate },
          { fee: standard.value, feeRate: standard.rate },
          { fee: high.value, feeRate: high.rate },
        ],
      } satisfies Fees;
    },
  });
}
