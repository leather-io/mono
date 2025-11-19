import BigNumber from 'bignumber.js';

import { type Money, SwapDex } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { LeatherApiSwapDex } from '../infrastructure/api/leather/leather-api.client';

export function mapToSwapDex(dex: LeatherApiSwapDex): SwapDex {
  return {
    name: dex.name,
    url: dex.url,
    logo: dex.logo,
    description: dex.description,
  };
}

export function mapBitflowDexProviderToSwapDexId(dex = 'Unknown') {
  const lowercaseDexName = dex.toLowerCase();
  if (lowercaseDexName.includes('alex')) {
    return 'alex';
  }
  if (lowercaseDexName.includes('arkadiko')) {
    return 'arkadiko';
  }
  if (lowercaseDexName.includes('bitflow')) {
    return 'bitflow';
  }
  if (lowercaseDexName.includes('velar')) {
    return 'velar';
  }
  return 'unknown';
}

export function calculateMinToReceiveAmount(quoteAmount: Money, slippage: number): Money {
  const minReceiveAmount = quoteAmount.amount.times(BigNumber(1).minus(slippage));
  return createMoney(
    minReceiveAmount.integerValue(BigNumber.ROUND_DOWN),
    quoteAmount.symbol,
    quoteAmount.decimals
  );
}
