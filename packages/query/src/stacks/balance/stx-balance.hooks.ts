import { Money } from '@leather-wallet/models';
import { createMoney } from '@leather-wallet/utils';
import BigNumber from 'bignumber.js';

import {
  AccountBalanceStxKeys,
  AccountStxBalanceBigNumber,
  AddressBalanceResponse,
} from '../../../types/account';
import { accountBalanceStxKeys } from '../../../types/stacks-account';
import { useStacksAccountBalanceQuery } from './stx-balance.query';

export function parseBalanceResponse(balances: AddressBalanceResponse) {
  const stxMoney = Object.fromEntries(
    accountBalanceStxKeys.map(key => [
      key,
      { amount: new BigNumber(balances.stx[key]), symbol: 'STX' },
    ])
  ) as Record<AccountBalanceStxKeys, Money>;

  const stx: AccountStxBalanceBigNumber & { unlockedStx: Money } = {
    ...balances.stx,
    ...stxMoney,
    balance: createMoney(stxMoney.balance.amount, 'STX'),
    locked: createMoney(stxMoney.locked.amount, 'STX'),
    unlockedStx: createMoney(stxMoney.balance.amount.minus(stxMoney.locked.amount), 'STX'),
  };
  return { ...balances, stx };
}

export function useStacksAccountBalances(address: string) {
  return useStacksAccountBalanceQuery(address, {
    select: resp => parseBalanceResponse(resp),
  });
}
