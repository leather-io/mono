import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';

import { FeeTypes, Money } from '@leather.io/models';

import { getStacksFeeData } from '../../utils';
import { BaseFeeCard } from './base-fee-card';

interface FeeCardProps {
  feeType: FeeTypes;
  amount: Money;
  onPress(): void;
}

export function StacksFeeCard({ feeType, amount, onPress }: FeeCardProps) {
  const { data: stxMarketData } = useStxMarketDataQuery();
  const { icon, title, time } = getStacksFeeData(feeType);

  return (
    <BaseFeeCard
      amount={amount}
      onPress={onPress}
      marketData={stxMarketData}
      icon={icon}
      title={title}
      time={time}
    />
  );
}
