import BigNumber from 'bignumber.js';
import { pick } from 'remeda';

import { type Money, type StacksProtocol, type SwapQuote } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { type EnrichedSwapQuote } from '../../swap-state.types';
import { PER_DEX_FEE_PERCENTAGE } from '../../swap.constants';
import { calculatePriceImpactPercentage, estimateExchangeRate } from '../../utils/market-rates';

export function calculateMinToReceiveAmount(targetAmount: Money, slippage: number): Money {
  const minReceiveAmount = targetAmount.amount.times(BigNumber(1).minus(slippage));
  return createMoney(
    minReceiveAmount.integerValue(BigNumber.ROUND_DOWN),
    targetAmount.symbol,
    targetAmount.decimals
  );
}

export function estimateLiquidityFeePercentage(dexPath: StacksProtocol[]) {
  return BigNumber(dexPath.length).times(PER_DEX_FEE_PERCENTAGE);
}

export function createBaseEnrichedQuote(
  swapQuote: SwapQuote,
  fairMarketRate: BigNumber | null
): Omit<
  EnrichedSwapQuote,
  'slippageApplicable' | 'minReceive' | 'providerFeePercentage' | 'swapRate'
> {
  const rate = estimateExchangeRate(swapQuote.baseAmount, swapQuote.targetAmount);
  return {
    rawSwapQuote: swapQuote,
    ...pick(swapQuote, [
      'baseAmount',
      'targetAmount',
      'baseAsset',
      'targetAsset',
      'dexPath',
      'assetPath',
      'createdAt',
      'isExecutable',
      'executionConstraints',
    ]),
    provider: swapQuote.providerId,
    score: swapQuote.targetAmount.amount.toNumber(),
    priceImpactPercentage: calculatePriceImpactPercentage(rate, fairMarketRate),
  };
}
