import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';
import { FeeBadge } from '@/features/send/fee-badge';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';
import { t } from '@lingui/macro';

import { FeeTypes, Money } from '@leather.io/models';
import {
  AnimalChameleonIcon,
  AnimalEagleIcon,
  AnimalRabbitIcon,
  AnimalSnailIcon,
  Avatar,
  Box,
  Cell,
  ChevronRightIcon,
  Text,
} from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, match } from '@leather.io/utils';

interface FeeCardProps {
  feeType: FeeTypes;
  amount: Money;
}

export function BitcoinFeeCard({ feeType, amount }: FeeCardProps) {
  const matchFeeType = match<FeeTypes>();
  const feeIcon = matchFeeType<ReactNode>(feeType, {
    [FeeTypes.Low]: <AnimalSnailIcon />,
    [FeeTypes.Middle]: <AnimalRabbitIcon />,
    [FeeTypes.High]: <AnimalEagleIcon />,
    [FeeTypes.Custom]: <AnimalChameleonIcon />,
    [FeeTypes.Unknown]: <AnimalChameleonIcon />,
  });

  const { data: btcMarketData } = useBtcMarketDataQuery();

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
        <Cell.Root pressable={true}>
          <Cell.Icon>
            <Avatar bg="ink.background-secondary" p="2">
              {feeIcon}
            </Avatar>
          </Cell.Icon>
          <Cell.Content>
            <Cell.Label variant="primary">
              {t({
                id: 'approver.fee.type.normal',
                message: 'Normal',
              })}
            </Cell.Label>
            <Cell.Label variant="secondary">
              {t({
                id: 'approver.fee.speed.normal',
                message: '~20 mins',
              })}
            </Cell.Label>
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
