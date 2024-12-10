import { BitcoinTokenBalance } from '@/features/balances/bitcoin/bitcoin-balance';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

export function BitcoinOutcome({ amount }: { amount: Money }) {
  const { data: btcMarketData } = useBtcMarketDataQuery();

  const fiatBalance = baseCurrencyAmountInQuoteWithFallback(amount, btcMarketData);

  return (
    <>
      <Text variant="label01">
        {t({
          id: 'approver.outcomes.title1',
          message: "You'll send",
        })}
      </Text>
      <Box mx="-5">
        <BitcoinTokenBalance availableBalance={amount} fiatBalance={fiatBalance} />
      </Box>
    </>
  );
}
