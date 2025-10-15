import { currencyDecimalsMap } from '@leather.io/constants';
import { MarketPriceSnapshot } from '@leather.io/models';
import { convertAmountToFractionalUnit, createMoney, initBigNumber } from '@leather.io/utils';

export function convertApiPriceSnapshots(
  snapshots: { price: number; timestamp: string }[]
): MarketPriceSnapshot[] {
  return snapshots.map(h => ({
    price: createMoney(
      convertAmountToFractionalUnit(initBigNumber(h.price), currencyDecimalsMap['USD']),
      'USD'
    ),
    timestamp: new Date(h.timestamp).getTime(),
  }));
}
