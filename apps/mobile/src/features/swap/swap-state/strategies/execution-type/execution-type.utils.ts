import { PER_DEX_FEE_PERCENTAGE } from '@/features/swap/swap-state/swap.constants';
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
  return BigNumber(dexPath.length).times(PER_DEX_FEE_PERCENTAGE);
}
