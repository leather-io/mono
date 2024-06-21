import { type RuneCryptoAssetInfo, createCryptoAssetBalance } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { RuneBalance, RuneTickerInfo } from '../bitcoin-client';

const defaultRunesSymbol = '¤';

function createRuneCryptoAssetInfo(tickerInfo: RuneTickerInfo): RuneCryptoAssetInfo {
  return {
    decimals: tickerInfo.decimals,
    hasMemo: false,
    name: 'rune',
    runeName: tickerInfo.rune_name,
    spacedRuneName: tickerInfo.spaced_rune_name,
    symbol: tickerInfo.symbol ?? defaultRunesSymbol,
  };
}

export function createRuneCryptoAssetDetails(runeBalance: RuneBalance, tickerInfo: RuneTickerInfo) {
  return {
    balance: createCryptoAssetBalance(
      createMoney(Number(runeBalance.total_balance), tickerInfo.rune_name, tickerInfo.decimals)
    ),
    info: createRuneCryptoAssetInfo(tickerInfo),
  };
}
