import { ReactElement } from 'react';

import { Balance } from '@/components/balance/balance';

import { MarketData, Money } from '@leather.io/models';
import { Avatar, Box, Cell, ChevronRightIcon, IconProps } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback } from '@leather.io/utils';

interface BaseFeeCardProps {
  amount: Money;
  onPress(): void;
  marketData: MarketData | undefined;
  icon: ReactElement<IconProps>;
  title: string;
  time: string;
}

export function BaseFeeCard({ amount, onPress, marketData, icon, title, time }: BaseFeeCardProps) {
  const quoteAmount = baseCurrencyAmountInQuoteWithFallback(amount, marketData);

  return (
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
              <Balance
                balance={quoteAmount}
                variant="label02"
                color="ink.text-subdued"
                isQuoteCurrency
              />
            </Box>
            <ChevronRightIcon variant="small" />
          </Box>
        </Cell.Aside>
      </Cell.Root>
    </Box>
  );
}
