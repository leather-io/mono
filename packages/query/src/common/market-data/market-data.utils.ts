import BigNumber from 'bignumber.js';

import { currencyDecimalsMap } from '@leather.io/constants';
import { convertAmountToFractionalUnit, isDefined } from '@leather.io/utils';

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
    .filter(isDefined)
    .map(val => new BigNumber(val))
    .map(val => convertAmountToFractionalUnit(val, currencyDecimalsMap.USD));
}
