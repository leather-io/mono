import BigNumber from 'bignumber.js';

import { MarketData } from '@leather.io/models';

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

export function estimateExchangeRate(baseAmount: number, targetAmount: number): BigNumber {
  const base = BigNumber(baseAmount);
  if (base.isZero()) return BigNumber(0);
  return BigNumber(targetAmount).div(base);
}
