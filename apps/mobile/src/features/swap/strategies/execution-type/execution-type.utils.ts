import BigNumber from 'bignumber.js';

import { Money, SwapDex } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export function calculateMinToReceiveAmount(quoteAmount: Money, slippage: number): Money {
  const minReceiveAmount = quoteAmount.amount.times(BigNumber(1).minus(slippage));
  return createMoney(
    minReceiveAmount.integerValue(BigNumber.ROUND_DOWN),
    quoteAmount.symbol,
    quoteAmount.decimals
  );
}

export function estimateLiquidityFeePercentage(dexPath: SwapDex[]) {
  const perDexFeePercentage = 0.003;
  return new BigNumber(dexPath.length).times(perDexFeePercentage).toNumber();
}
