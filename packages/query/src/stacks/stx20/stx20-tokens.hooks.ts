import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { Stx20CryptoAssetInfo } from '@leather.io/models';
import { createBaseCryptoAssetBalance, createMoney } from '@leather.io/utils';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { useStacksClient } from '../stacks-client';
import { Stx20Balance } from '../stx20-api-types';
import { createGetStx20BalancesQueryOptions } from './stx20-tokens.query';

function createStx20CryptoAssetInfo(stx20Balance: Stx20Balance): Partial<Stx20CryptoAssetInfo> {
  return {
    chain: 'stacks',
    category: 'fungible',
    protocol: 'stx20',
    symbol: stx20Balance.ticker,
  };
}

export function useStx20Tokens(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  return useQuery({
    ...createGetStx20BalancesQueryOptions({
      address,
      chainId: network.chain.stacks.chainId,
      client,
    }),
    select: resp =>
      resp.map(stx20Balance => ({
        balance: createBaseCryptoAssetBalance(
          createMoney(new BigNumber(stx20Balance.balance), stx20Balance.ticker, 0)
        ),
        info: createStx20CryptoAssetInfo(stx20Balance),
      })),
  });
}
