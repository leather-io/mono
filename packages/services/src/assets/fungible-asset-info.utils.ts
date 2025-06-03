import { currencyDecimalsMap } from '@leather.io/constants';
import { convertAmountToFractionalUnit, createMoney, initBigNumber } from '@leather.io/utils';

import { LeatherApiTokenPriceHistory } from '../infrastructure/api/leather/leather-api.client';
import { AssetPriceSnapshot } from '../types';

export function mapPriceHistory(history: LeatherApiTokenPriceHistory): AssetPriceSnapshot[] {
  return history.map(h => ({
    price: createMoney(
      convertAmountToFractionalUnit(initBigNumber(h.price), currencyDecimalsMap['USD']),
      'USD'
    ),
    timestamp: new Date(h.timestamp).getTime(),
  }));
}
