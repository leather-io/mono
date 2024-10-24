import { CoincapAssetResponse } from './coincap-api.client';
import { mapToCoincapCurrency, readCoincapAssetPrice } from './coincap-api.utils';

describe(mapToCoincapCurrency.name, () => {
  it('should should map currency correctly', () => {
    expect(mapToCoincapCurrency('BTC')).toBe('bitcoin');
    expect(mapToCoincapCurrency('STX')).toBe('stacks');
  });
});

describe(readCoincapAssetPrice.name, () => {
  it('should extract price from Asset API response and convert to number', () => {
    const mockAssetResponse = {
      data: {
        priceUsd: '12345',
      },
    };
    const price = readCoincapAssetPrice(mockAssetResponse as CoincapAssetResponse);
    expect(price).toBe(12345);
  });
  it('should return undefined from malformed, missing, or non-numerical responses', () => {
    expect(readCoincapAssetPrice({} as CoincapAssetResponse)).toBe(undefined);
    expect(readCoincapAssetPrice(null as any)).toBe(undefined);
    expect(
      readCoincapAssetPrice({
        data: {
          priceUsd: 'non-numeric',
        },
      } as CoincapAssetResponse)
    ).toBe(undefined);
  });
});
