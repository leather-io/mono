import { type StacksTransactionWire, estimateTransactionByteLength } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';

import {
  FeeCalculationTypes,
  type Fees,
  type StacksTransactionFeeQuote,
  type TransactionFeeQuote,
} from '@leather.io/models';
import { getStacksTransactionFeesService } from '@leather.io/services';
import { getSerializedUnsignedStacksTxPayload } from '@leather.io/stacks';

function assertIsStacksFeeRateQuote(
  quote: TransactionFeeQuote
): asserts quote is StacksTransactionFeeQuote {
  if (quote.type !== 'stacksFeeRate') {
    throw new Error(`Unexpected fee quote type for Stacks transaction: ${quote.type}`);
  }
}

type StacksTxFeesQueryKey = readonly [
  'stacks-tx-fees',
  payload: string,
  estimatedTransactionByteLength: number,
  tx: StacksTransactionWire | undefined,
];

export function useCalculateStacksTxFees(unsignedTx?: StacksTransactionWire) {
  const payload = unsignedTx ? getSerializedUnsignedStacksTxPayload(unsignedTx) : '';
  const estimatedTransactionByteLength = unsignedTx ? estimateTransactionByteLength(unsignedTx) : 0;

  return useQuery<Fees, Error, Fees, StacksTxFeesQueryKey>({
    enabled: !!unsignedTx,
    queryKey: ['stacks-tx-fees', payload, estimatedTransactionByteLength, unsignedTx],
    queryFn: async ({ signal, queryKey }) => {
      const [, , , tx] = queryKey;
      if (!tx) throw new Error('Stacks tx fees query was called without unsigned tx');

      const service = getStacksTransactionFeesService();
      const res = await service.getStacksTransactionFees(tx, signal);
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
