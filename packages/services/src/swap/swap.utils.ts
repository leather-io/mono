import { SwapDex } from '@leather.io/models';

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
