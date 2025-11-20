import { PER_DEX_FEE_PERCENTAGE } from '@/features/swap/swap-state/swap.constants';
import BigNumber from 'bignumber.js';

import { Money, SwapDex } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export function calculateMinToReceiveAmount(targetAmount: Money, slippage: number): Money {
  const minReceiveAmount = targetAmount.amount.times(BigNumber(1).minus(slippage));
  return createMoney(
    minReceiveAmount.integerValue(BigNumber.ROUND_DOWN),
    targetAmount.symbol,
    targetAmount.decimals
  );
}

export function estimateLiquidityFeePercentage(dexPath: SwapDex[]) {
  return BigNumber(dexPath.length).times(PER_DEX_FEE_PERCENTAGE);
}
