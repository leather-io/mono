import BigNumber from 'bignumber.js';

import type { Money, StxCryptoAssetBalance } from '@leather-wallet/models';
import { createMoney, subtractMoney, sumMoney } from '@leather-wallet/utils';

import {
  AccountBalanceStxKeys,
  AddressBalanceResponse,
  accountBalanceStxKeys,
} from '../hiro-api-types';
import {
  useMempoolTxsInboundBalance,
  useMempoolTxsOutboundBalance,
} from '../mempool/mempool.hooks';
import { useStacksAccountBalanceQuery } from './account-balance.query';

function createStxMoney(resp: AddressBalanceResponse) {
  return Object.fromEntries(
    accountBalanceStxKeys.map(key => [key, { amount: new BigNumber(resp.stx[key]), symbol: 'STX' }])
  ) as Record<AccountBalanceStxKeys, Money>;
}

function createStxCryptoAssetBalance(
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

export function useStxCryptoAssetBalance(address: string) {
  const inboundBalance = useMempoolTxsInboundBalance(address);
  const outboundBalance = useMempoolTxsOutboundBalance(address);
  return useStacksAccountBalanceQuery(address, {
    select: resp =>
      createStxCryptoAssetBalance(createStxMoney(resp), inboundBalance, outboundBalance),
  });
}

export function useStxAvailableUnlockedBalance(address: string) {
  return useStxCryptoAssetBalance(address).data?.unlockedBalance ?? createMoney(0, 'STX');
}

export function useStacksAccountBalanceFungibleTokens(address: string) {
  return useStacksAccountBalanceQuery(address, {
    select: resp => resp.fungible_tokens,
  });
}
