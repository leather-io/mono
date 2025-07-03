import { StacksTokenBalance } from '@/features/balances/stacks/stacks-balance';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';

import { Money } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

export function StacksOutcome({ amount }: { amount: Money }) {
  const { data: stxMarketData } = useStxMarketDataQuery();

  const quoteBalance = baseCurrencyAmountInQuoteWithFallback(amount, stxMarketData);
  return (
    <Box mx="-5">
      <StacksTokenBalance availableBalance={amount} quoteBalance={quoteBalance} py="3" />
    </Box>
  );
}
