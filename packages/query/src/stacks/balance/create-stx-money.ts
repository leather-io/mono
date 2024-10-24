import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';

import {
  AccountBalanceStxKeys,
  AddressBalanceResponse,
  accountBalanceStxKeys,
} from '../hiro-api-types';

export function createStxMoney(resp: AddressBalanceResponse) {
  return Object.fromEntries(
    accountBalanceStxKeys.map(key => [key, { amount: new BigNumber(resp.stx[key]), symbol: 'STX' }])
  ) as Record<AccountBalanceStxKeys, Money>;
}
