import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';

import { createMoney } from './money';

export function calculateMinToReceiveAmount(quoteAmount: Money, slippage: number): Money {
  const minReceiveAmount = quoteAmount.amount.times(BigNumber(1).minus(slippage));
  return createMoney(
    minReceiveAmount.integerValue(BigNumber.ROUND_DOWN),
    quoteAmount.symbol,
    quoteAmount.decimals
  );
}
