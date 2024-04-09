import { BTC_DECIMALS, STX_DECIMALS } from '@leather-wallet/constants';
import BigNumber from 'bignumber.js';

import type { Currencies } from './currencies.model';

export type NumType = BigNumber | bigint | number;

export interface Money {
  readonly amount: BigNumber;
  readonly symbol: Currencies;
  readonly decimals: number;
}

// Units of `Money` should be declared in their smallest unit. Similar to
// Rosetta, we model currencies with their respective resolution
export const currencyDecimalsMap = {
  BTC: BTC_DECIMALS,
  STX: STX_DECIMALS,
  USD: 2,
} as const;
