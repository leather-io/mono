import { ReactElement } from 'react';

import { Balance } from '@/components/balance/balance';
import { FeeBadge } from '@/features/send/components/fee-badge';
import { t } from '@lingui/macro';

import { MarketData, Money } from '@leather.io/models';
import { Avatar, Box, Cell, ChevronRightIcon, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

interface BaseFeeCardProps {
  amount: Money;
  onPress(): void;
  marketData: MarketData | undefined;
  icon: ReactElement;
  title: string;
  time: string;
}

export function BaseFeeCard({ amount, onPress, marketData, icon, title, time }: BaseFeeCardProps) {
  const fiatBalance = baseCurrencyAmountInQuoteWithFallback(amount, marketData);

  return (
    <>
      <Box flexDirection="row" gap="2">
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
            <Avatar icon={icon} />
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
