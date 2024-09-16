import type BigNumber from 'bignumber.js';

import type { Currency } from './currencies.model';

export type NumType = BigNumber | bigint | number;

export interface Money {
  readonly amount: BigNumber;
  readonly symbol: Currency;
  readonly decimals: number;
}
