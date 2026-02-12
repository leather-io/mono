import { getPriceChangeColor } from '@leather.io/features';
import { Money } from '@leather.io/models';
import { ArrowTriangleTopIcon, SkeletonLoader, Text } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { Balance } from './balance';
import { emptyAmountPlaceholder } from './constants';

interface PriceChange {
  price?: Money;
  changePercent?: number;
}
export function PriceChange({ price, changePercent }: PriceChange) {
  if (!price || !changePercent) {
    return (
      <Text variant="label02" color="ink.text-primary">
        {emptyAmountPlaceholder}
      </Text>
    );
  }

  const priceAmount = typeof price.amount === 'number' ? price.amount : Number(price.amount);
  const priceChange = (priceAmount * changePercent) / 100;
  const priceChangeFiat = createMoney(priceChange, price.symbol);
  const color = getPriceChangeColor(changePercent);

  return (
    <>
      {changePercent !== 0 && (
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
      {
        <Text variant="label02" color={color}>
          {`${changePercent.toFixed(2)}% `}
        </Text>
      }
      <SkeletonLoader height={16} width={100} isLoading>
        <Balance
          formattingOptions={{ numberFormatOptions: { signDisplay: 'never' } }}
          forceVisible
          balance={priceChangeFiat}
          variant="label02"
          lineHeight={16}
          color={color}
        />
      </SkeletonLoader>
    </>
  );
}
