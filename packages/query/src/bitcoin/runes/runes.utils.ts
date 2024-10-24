import {
  Money,
  type RuneCryptoAssetInfo,
  createCryptoAssetBalance,
  createMarketData,
  createMarketPair,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { RuneBalance, RuneTickerInfo } from '../clients/best-in-slot';

const defaultRunesSymbol = '¤';

function createRuneCryptoAssetInfo(tickerInfo: RuneTickerInfo): RuneCryptoAssetInfo {
  return {
    chain: 'bitcoin',
    category: 'fungible',
    protocol: 'rune',
    decimals: tickerInfo.decimals,
    hasMemo: false,
    runeName: tickerInfo.rune_name,
    spacedRuneName: tickerInfo.spaced_rune_name,
    symbol: tickerInfo.symbol ?? defaultRunesSymbol,
  };
}

export function createRuneCryptoAssetDetails(
  runeBalance: RuneBalance,
  tickerInfo: RuneTickerInfo,
  fiatPrice: Money
) {
  return {
    balance: createCryptoAssetBalance(
      createMoney(Number(runeBalance.total_balance), tickerInfo.rune_name, tickerInfo.decimals)
    ),
    info: createRuneCryptoAssetInfo(tickerInfo),
    marketData: createMarketData(
      createMarketPair(tickerInfo.rune_name, 'USD'),
      createMoney(fiatPrice.amount, 'USD')
    ),
  };
}
