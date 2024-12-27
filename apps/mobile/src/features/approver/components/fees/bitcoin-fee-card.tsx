import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';

import { FeeTypes, Money } from '@leather.io/models';

import { getBitcoinFeeData } from '../../utils';
import { BaseFeeCard } from './base-fee-card';

interface FeeCardProps {
  feeType: FeeTypes;
  amount: Money;
  onPress(): void;
}

export function BitcoinFeeCard({ feeType, amount, onPress }: FeeCardProps) {
  const { data: btcMarketData } = useBtcMarketDataQuery();
  const { icon, title, time } = getBitcoinFeeData(feeType);

  return (
    <BaseFeeCard
      amount={amount}
      onPress={onPress}
      marketData={btcMarketData}
      icon={icon}
      title={title}
      time={time}
    />
  );
}
