import { Balance } from '@/components/balance/balance';

import { Money } from '@leather.io/models';
import { ArrowTriangleTopIcon, Box, Text } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

function getPriceChangeColor(changePercent: number) {
  if (changePercent > 0) {
    return 'green.action-primary-default';
  } else if (changePercent < 0) {
    return 'red.action-primary-default';
  } else {
    return 'ink.text-primary';
  }
}

export function TokenPriceChange({
  price,
  changePercent,
}: {
  price: Money;
  changePercent: number;
}) {
  const priceAmount = typeof price.amount === 'number' ? price.amount : Number(price.amount);
  const priceChange = (priceAmount * changePercent) / 100;
  const priceChangeFiat = createMoney(priceChange, price.symbol);
  const color = getPriceChangeColor(changePercent);

  return (
    <Box flexDirection="row" alignItems="baseline" gap="1">
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
      <Text variant="label02" color={color}>
        {`${changePercent}% `}
      </Text>
      <Balance
        formattingOptions={{ numberFormatOptions: { signDisplay: 'never' } }}
        forceVisible
        balance={priceChangeFiat}
        variant="label02"
        lineHeight={16}
        color={color}
      />
    </Box>
  );
}
