import BigNumber from 'bignumber.js';

import { MarketData } from '@leather.io/models';

interface CalculateFairMarketRateParams {
  baseMarketData: MarketData | null | undefined;
  targetMarketData: MarketData | null | undefined;
}

export function calculateFairMarketRate({
  baseMarketData,
  targetMarketData,
}: CalculateFairMarketRateParams): number | null {
  if (!baseMarketData || !targetMarketData) return null;
  if (!baseMarketData.price || !targetMarketData.price) return null;

  const basePrice = baseMarketData.price.amount;
  const targetPrice = targetMarketData.price.amount;

  if (basePrice.isZero() || targetPrice.isZero()) return null;

  return basePrice.div(targetPrice).toNumber();
}

export function calculatePriceImpactPercentage(
  quotedRate: number,
  fairMarketRate: number | null
): number | null {
  if (fairMarketRate === null || fairMarketRate === 0 || quotedRate === 0) return null;

  const priceImpact = new BigNumber(fairMarketRate)
    .minus(quotedRate)
    .div(fairMarketRate)
    .toNumber();

  return Math.max(0, priceImpact);
}

export function estimateExchangeRate(baseAmount: number, targetAmount: number): number {
  const base = new BigNumber(baseAmount);
  if (base.isZero()) return 0;
  return new BigNumber(targetAmount).div(base).toNumber();
}
