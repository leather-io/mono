import type { Money } from '@leather.io/models';
import { convertAmountToBaseUnit, createMoneyFromDecimal, initBigNumber } from '@leather.io/utils';

export function convertMoneyToAlexSdkAmount(money: Money): bigint {
  return BigInt(Math.floor(convertAmountToBaseUnit(money).shiftedBy(8).toNumber()));
}

export function convertAlexSdkAmountToMoney(
  amount: bigint,
  symbol: string,
  decimals: number
): Money {
  return createMoneyFromDecimal(initBigNumber(amount).shiftedBy(-8).toNumber(), symbol, decimals);
}
