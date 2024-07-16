import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

import { Stx20CryptoAssetInfo, createCryptoAssetBalance } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { useStacksClient } from '../stacks-client';
import { Stx20Balance } from '../stx20-api-types';
import { createGetStx20BalancesQueryOptions } from './stx20-tokens.query';

function createStx20CryptoAssetInfo(stx20Balance: Stx20Balance): Stx20CryptoAssetInfo {
  return {
    name: 'stx-20',
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
        balance: createCryptoAssetBalance(
          createMoney(new BigNumber(stx20Balance.balance), stx20Balance.ticker, 0)
        ),
        info: createStx20CryptoAssetInfo(stx20Balance),
      })),
  });
}
