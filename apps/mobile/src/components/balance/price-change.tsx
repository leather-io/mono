import { Money } from '@leather.io/models';
import { ArrowTriangleTopIcon, SkeletonLoader, Text } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { Balance } from './balance';
import { EmptyBalanceDisplay } from './constants';

function getPriceChangeColor(changePercent: number) {
  if (changePercent > 0) {
    return 'green.action-primary-default';
  } else if (changePercent < 0) {
    return 'red.action-primary-default';
  } else {
    return 'ink.text-primary';
  }
}

interface PriceChange {
  price?: Money;
  changePercent?: number;
  isLoading: boolean;
}
export function PriceChange({ price, changePercent, isLoading }: PriceChange) {
  if (isLoading) {
    return <SkeletonLoader height={16} width={100} isLoading />;
  }

  if (!price || !changePercent) {
    return (
      <Text variant="label02" color="ink.text-primary">
        {EmptyBalanceDisplay}
      </Text>
    );
  }

  const priceAmount = typeof price.amount === 'number' ? price.amount : Number(price.amount);
  const priceChange = (priceAmount * changePercent) / 100;
  const priceChangeFiat = createMoney(priceChange, price.symbol);
  const color = getPriceChangeColor(changePercent);

  return (
    <>
      {!isLoading && changePercent !== 0 && (
        <ArrowTriangleTopIcon
          color={color}
          width={8}
          height={8}
          style={{
            alignSelf: 'center',
            transform: [{ rotate: changePercent < 0 ? '180deg' : '0deg' }],
          }}
        />
      )}
      {!isLoading && (
        <Text variant="label02" color={color}>
          {`${changePercent.toFixed(2)}% `}
        </Text>
      )}
      <Balance
        formattingOptions={{ numberFormatOptions: { signDisplay: 'never' } }}
        forceVisible
        balance={priceChangeFiat}
        variant="label02"
        lineHeight={16}
        color={color}
        isLoading={isLoading}
      />
    </>
  );
}
