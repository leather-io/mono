import { StacksTokenBalance } from '@/features/balances/stacks/stacks-balance';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

export function StacksOutcome({ amount }: { amount: Money }) {
  const { data: stxMarketData } = useStxMarketDataQuery();

  const quoteBalance = baseCurrencyAmountInQuoteWithFallback(amount, stxMarketData);
  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.outcomes.title1',
          message: "You'll send",
        })}
      </Text>
      <Box mx="-5">
        <StacksTokenBalance availableBalance={amount} quoteBalance={quoteBalance} py="3" />
      </Box>
    </>
  );
}
