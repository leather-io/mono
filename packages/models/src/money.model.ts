import BigNumber from 'bignumber.js';

import type { Currencies } from './currencies.model';

export type NumType = BigNumber | bigint | number;

export interface Money {
  readonly amount: BigNumber;
  readonly symbol: Currencies;
  readonly decimals: number;
}
