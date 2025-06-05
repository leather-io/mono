import { ReactElement } from 'react';

import { Balance } from '@/components/balance/balance';
import { useDynamicFeeFlag } from '@/features/feature-flags';
import { FeeBadge } from '@/features/send/components/fee-badge';
import { t } from '@lingui/macro';

import { MarketData, Money } from '@leather.io/models';
import { Avatar, Box, Cell, ChevronRightIcon, IconProps, Text } from '@leather.io/ui/native';
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
  const releaseDynamicFee = useDynamicFeeFlag();

  return (
    <>
      <Box flexDirection="row" gap="2">
        <Text variant="label01">
          {t({
            id: 'approver.fee.title',
            message: 'Fee',
          })}
        </Text>
        {/* PRO-77 hide fee badge until dynamic fee is implemented */}
        {releaseDynamicFee && <FeeBadge type="normal" />}
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
    </>
  );
}
