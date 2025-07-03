import { BitcoinTokenBalance } from '@/features/balances/bitcoin/bitcoin-balance';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';

import { Money } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

export function BitcoinOutcome({ amount }: { amount: Money }) {
  const { data: btcMarketData } = useBtcMarketDataQuery();

  const quoteBalance = baseCurrencyAmountInQuoteWithFallback(amount, btcMarketData);

  return (
    <Box mx="-5">
      <BitcoinTokenBalance availableBalance={amount} quoteBalance={quoteBalance} />
    </Box>
  );
}
