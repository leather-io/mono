import BigNumber from 'bignumber.js';

export function calculateBtcUsdEchangeRate(btcPriceUsd: BigNumber) {
  return new BigNumber(1).div(btcPriceUsd);
}

export function calculateSatsUsdEchangeRate(btcPriceUsd: BigNumber) {
  return calculateBtcUsdEchangeRate(btcPriceUsd).times(100_000_000);
}
