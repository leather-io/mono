import BigNumber from 'bignumber.js';

import type { Money, StxCryptoAssetBalance } from '@leather.io/models';
import { createMoney, subtractMoney, sumMoney } from '@leather.io/utils';

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

export function createStxCryptoAssetBalance(
  stxMoney: Record<AccountBalanceStxKeys, Money>,
  inboundBalance: Money,
  outboundBalance: Money
): StxCryptoAssetBalance {
  const totalBalance = createMoney(stxMoney.balance.amount, 'STX');
  const unlockedBalance = subtractMoney(stxMoney.balance, stxMoney.locked);

  return {
    availableBalance: subtractMoney(totalBalance, outboundBalance),
    availableUnlockedBalance: subtractMoney(unlockedBalance, outboundBalance),
    inboundBalance,
    lockedBalance: createMoney(stxMoney.locked.amount, 'STX'),
    outboundBalance,
    pendingBalance: subtractMoney(sumMoney([totalBalance, inboundBalance]), outboundBalance),
    totalBalance,
    unlockedBalance,
  };
}
