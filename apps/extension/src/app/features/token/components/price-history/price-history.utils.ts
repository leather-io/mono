import type { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export function calculatePriceChangeDelta(price: Money, changePercent: number): Money {
  const deltaAmount = price.amount.multipliedBy(changePercent).dividedBy(100);
  return createMoney(deltaAmount, price.symbol);
}
