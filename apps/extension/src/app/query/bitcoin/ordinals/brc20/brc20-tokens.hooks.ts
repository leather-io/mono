import BigNumber from 'bignumber.js';

import { type Brc20Asset, createMarketData, createMarketPair } from '@leather.io/models';
import { isFetchedWithSuccess } from '@leather.io/query';
import { createBaseCryptoAssetBalance, createMoney, unitToFractionalUnit } from '@leather.io/utils';

import { useCalculateBitcoinFiatValue } from '@app/query/common/market-data/market-data.hooks';

import { useGetBrc20TokensQuery } from './brc20-tokens.query';

function createBrc20Asset(decimals: number, ticker: string): Brc20Asset {
  return {
    chain: 'bitcoin',
    category: 'fungible',
    protocol: 'brc20',
    decimals,
    hasMemo: false,
    symbol: ticker,
  };
}

export function useBrc20Tokens() {
  const calculateBitcoinFiatValue = useCalculateBitcoinFiatValue();

  const result = useGetBrc20TokensQuery();

  if (!isFetchedWithSuccess(result)) return [];

  const tokens = result.data.pages
    .flatMap(page => page.brc20Tokens)
    .filter(token => token.length > 0)
    .flatMap(token => token);

  return tokens.map(token => {
    const fiatPrice = calculateBitcoinFiatValue(
      createMoney(new BigNumber(token.balance.min_listed_unit_price ?? 0), 'BTC')
    );
    return {
      balance: createBaseCryptoAssetBalance(
        createMoney(
          unitToFractionalUnit(token.info.decimals)(new BigNumber(token.balance.overall_balance)),
          token.balance.ticker,
          token.info.decimals
        )
      ),
      info: createBrc20Asset(token.info.decimals, token.balance.ticker),
      holderAddress: token.holderAddress,
      marketData: createMarketData(
        createMarketPair(token.balance.ticker, 'USD'),
        createMoney(fiatPrice.amount, 'USD')
      ),
    };
  });
}
