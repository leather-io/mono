import BigNumber from 'bignumber.js';

import { initBigNumber } from '@leather.io/utils';

export function calculateBtcUsdEchangeRate(btcPriceUsd: BigNumber) {
  return initBigNumber(new BigNumber(1).div(btcPriceUsd));
}

export function calculateSatsUsdEchangeRate(btcPriceUsd: BigNumber) {
  return calculateBtcUsdEchangeRate(btcPriceUsd).times(100_000_000);
}
