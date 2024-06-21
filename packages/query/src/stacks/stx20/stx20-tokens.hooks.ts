import BigNumber from 'bignumber.js';

import { type Stx20CryptoAssetInfo, createCryptoAssetBalance } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { Stx20Balance } from '../stx20-api-types';
import { useStx20BalancesQuery } from './stx20-tokens.query';

function createStx20CryptoAssetInfo(stx20Balance: Stx20Balance): Stx20CryptoAssetInfo {
  return {
    name: 'stx-20',
    symbol: stx20Balance.ticker,
  };
}

export function useStx20Tokens(address: string) {
  return useStx20BalancesQuery(address, {
    select: resp =>
      resp.map(stx20Balance => ({
        balance: createCryptoAssetBalance(
          createMoney(new BigNumber(stx20Balance.balance), stx20Balance.ticker, 0)
        ),
        info: createStx20CryptoAssetInfo(stx20Balance),
      })),
  });
}
