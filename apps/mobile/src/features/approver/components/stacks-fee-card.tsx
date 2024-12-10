import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';
import { FeeBadge } from '@/features/send/fee-badge';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { t } from '@lingui/macro';

import { FeeTypes, Money } from '@leather.io/models';
import {
  AnimalChameleonIcon,
  AnimalEagleIcon,
  AnimalRabbitIcon,
  AnimalSnailIcon,
  Avatar,
  Box,
  ChevronRightIcon,
  Flag,
  ItemLayout,
  Pressable,
  Text,
} from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, match } from '@leather.io/utils';

interface FeeCardProps {
  feeType: FeeTypes;
  amount: Money;
}

export function StacksFeeCard({ feeType, amount }: FeeCardProps) {
  const matchFeeType = match<FeeTypes>();
  const feeIcon = matchFeeType<ReactNode>(feeType, {
    [FeeTypes.Low]: <AnimalSnailIcon />,
    [FeeTypes.Middle]: <AnimalRabbitIcon />,
    [FeeTypes.High]: <AnimalEagleIcon />,
    [FeeTypes.Custom]: <AnimalChameleonIcon />,
    [FeeTypes.Unknown]: <AnimalChameleonIcon />,
  });

  const { data: stxMarketData } = useStxMarketDataQuery();

  const fiatBalance = baseCurrencyAmountInQuoteWithFallback(amount, stxMarketData);
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
      <Pressable flexDirection="row" onPress={() => {}} py="3">
        <Flag
          img={
            <Avatar bg="ink.background-secondary" p="1">
              {feeIcon}
            </Avatar>
          }
        >
          <ItemLayout
            titleLeft={t({
              id: 'approver.fee.type.normal',
              message: 'Normal',
            })}
            captionLeft={t({
              id: 'approver.fee.speed.normal',
              message: '~20 mins',
            })}
            titleRight={<Balance balance={amount} variant="label02" />}
            captionRight={
              <Balance balance={fiatBalance} variant="label02" color="ink.text-subdued" />
            }
            actionIcon={<ChevronRightIcon />}
          />
        </Flag>
      </Pressable>
    </>
  );
}
