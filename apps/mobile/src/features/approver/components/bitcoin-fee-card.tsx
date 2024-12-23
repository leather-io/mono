import { Balance } from '@/components/balance/balance';
import { FeeBadge } from '@/features/send/fee-badge';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { t } from '@lingui/macro';

import { FeeTypes, Money } from '@leather.io/models';
import { Avatar, Box, Cell, ChevronRightIcon, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

import { getFeeData } from '../utils';

interface FeeCardProps {
  feeType: FeeTypes;
  amount: Money;
  onPress(): void;
}

export function BitcoinFeeCard({ feeType, amount, onPress }: FeeCardProps) {
  const { data: btcMarketData } = useBtcMarketDataQuery();
  const { icon, title, time } = getFeeData(feeType);

  const fiatBalance = baseCurrencyAmountInQuoteWithFallback(amount, btcMarketData);
  return (
    <>
      <Box flexDirection="row">
        <Text variant="label01">
          {t({
            id: 'approver.fee.title',
            message: 'Fee',
          })}
        </Text>
        <FeeBadge type="normal" />
      </Box>
      <Box mx="-5">
        <Cell.Root pressable onPress={onPress}>
          <Cell.Icon>
            <Avatar bg="ink.background-secondary" p="2">
              {icon}
            </Avatar>
          </Cell.Icon>
          <Cell.Content>
            <Cell.Label variant="primary">{title}</Cell.Label>
            <Cell.Label variant="secondary">{time}</Cell.Label>
          </Cell.Content>
          <Cell.Aside>
            <Box flexDirection="row" alignItems="center" gap="2">
              <Box alignItems="flex-end">
                <Balance balance={amount} variant="label02" />
                <Balance balance={fiatBalance} variant="label02" color="ink.text-subdued" />
              </Box>
              <ChevronRightIcon variant="small" />
            </Box>
          </Cell.Aside>
        </Cell.Root>
      </Box>
    </>
  );
}
