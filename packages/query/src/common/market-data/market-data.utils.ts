import BigNumber from 'bignumber.js';

import { currencyDecimalsMap } from '@leather.io/constants';
import { convertAmountToFractionalUnit } from '@leather.io/utils';

interface MarketDataVendorWithPriceSelector {
  result: unknown;
  selector(v: unknown): string | number | undefined;
}
export function pullPriceDataFromAvailableResponses(
  responses: MarketDataVendorWithPriceSelector[]
) {
  return responses
    .filter(({ result }) => !!result)
    .map(({ result, selector: priceSelector }) => priceSelector(result))
    .map(val => new BigNumber(val ?? NaN))
    .map(val => convertAmountToFractionalUnit(val, currencyDecimalsMap.USD));
}
