import type { Money } from '@leather.io/models';
import { type FormatAmountOptions } from '@leather.io/utils';

export type FormatMoney = (money: Money, options?: FormatAmountOptions) => string;

export function addOperator(balance: string, operator?: string) {
  return operator ? `${operator} ${balance}` : balance;
}
