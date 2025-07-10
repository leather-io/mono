import { Balance } from '@/components/balance/balance';
import { useLingui } from '@lingui/react';

import { Money } from '@leather.io/models';
import { ArrowTriangleTopIcon, Text } from '@leather.io/ui/native';
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
  const { i18n } = useLingui();
  const priceAmount = typeof price.amount === 'number' ? price.amount : Number(price.amount);

  const priceChange = (priceAmount * changePercent) / 100;
  const priceChangeFiat = createMoney(priceChange, price.symbol);

  return (
    <>
      {changePercent !== 0 && (
        <ArrowTriangleTopIcon
          color={getPriceChangeColor(changePercent)}
          width={8}
          height={8}
          style={{ transform: [{ rotate: changePercent < 0 ? '180deg' : '0deg' }] }}
        />
      )}
      <Text variant="label02" color={getPriceChangeColor(changePercent)}>
        {i18n._({
          id: 'token.details.price_change_percentage',
          message: '{changePercent}%',
          values: {
            changePercent: changePercent,
          },
        })}{' '}
        (
        <Balance
          balance={priceChangeFiat}
          variant="label02"
          lineHeight={16}
          isQuoteCurrency
          color={getPriceChangeColor(changePercent)}
        />
        )
      </Text>
    </>
  );
}
