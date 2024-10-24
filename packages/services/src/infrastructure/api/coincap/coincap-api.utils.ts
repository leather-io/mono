import { CryptoCurrency } from '@leather.io/models';

import { CoincapAssetResponse } from './coincap-api.client';

export const coincapCurrencyMap: Record<CryptoCurrency, string> = {
  BTC: 'bitcoin',
  STX: 'stacks',
};

export function mapToCoincapCurrency(currency: CryptoCurrency): string {
  return coincapCurrencyMap[currency];
}

export function readCoincapAssetPrice(assetResponse: CoincapAssetResponse): number | undefined {
  try {
    const priceUsd = assetResponse.data.priceUsd;
    const price = parseFloat(priceUsd);
    if (isNaN(price)) return;
    return price;
  } catch (ignored) {
    return;
  }
}
