import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import type { Money, StxCryptoAssetBalance } from '@leather.io/models';
import { createMoney, subtractMoney, sumMoney } from '@leather.io/utils';

import { useCurrentNetworkState } from '../../leather-query-provider';
import {
  AccountBalanceStxKeys,
  AddressBalanceResponse,
  accountBalanceStxKeys,
} from '../hiro-api-types';
import {
  useMempoolTxsInboundBalance,
  useMempoolTxsOutboundBalance,
} from '../mempool/mempool.hooks';
import { useStacksClient } from '../stacks-client';
import { createGetStacksAccountBalanceQueryOptions } from './account-balance.query';

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

export function useStxCryptoAssetBalance(address: string) {
  const inboundBalance = useMempoolTxsInboundBalance(address);
  const outboundBalance = useMempoolTxsOutboundBalance(address);
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
      client,
      network: network.chain.stacks.url,
    }),
    select: resp =>
      createStxCryptoAssetBalance(createStxMoney(resp), inboundBalance, outboundBalance),
  });
}

export function useStxAvailableUnlockedBalance(address: string) {
  return useStxCryptoAssetBalance(address).data?.unlockedBalance ?? createMoney(0, 'STX');
}

export function useStacksAccountBalanceFungibleTokens(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    ...createGetStacksAccountBalanceQueryOptions({
      address,
      client,
      network: network.chain.stacks.url,
    }),
    select: resp => resp.fungible_tokens,
  });
}
