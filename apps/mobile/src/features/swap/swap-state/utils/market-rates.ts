import BigNumber from 'bignumber.js';

import { MarketData, Money } from '@leather.io/models';

interface CalculateFairMarketRateParams {
  baseMarketData: MarketData | null | undefined;
  targetMarketData: MarketData | null | undefined;
}

export function calculateFairMarketRate({
  baseMarketData,
  targetMarketData,
}: CalculateFairMarketRateParams): BigNumber | null {
  if (!baseMarketData || !targetMarketData) return null;

  const basePrice = baseMarketData.price.amount;
  const targetPrice = targetMarketData.price.amount;

  if (targetPrice.isZero()) return null;

  return basePrice.div(targetPrice);
}

export function calculatePriceImpactPercentage(
  quotedRate: BigNumber,
  fairMarketRate: BigNumber | null
): BigNumber | null {
  if (fairMarketRate === null || fairMarketRate.isZero() || quotedRate.isZero()) return null;

  const priceImpact = fairMarketRate.minus(quotedRate).div(fairMarketRate);

  return BigNumber.max(0, priceImpact);
}

export function estimateExchangeRate(base: Money, target: Money): BigNumber {
  if (base.amount.isZero()) return BigNumber(0);
  return target.amount.shiftedBy(-target.decimals).dividedBy(base.amount.shiftedBy(-base.decimals));
}
