import { btcAsset } from '@leather.io/constants';
import type { Money } from '@leather.io/models';
import type { AccountQuotedBtcBalance } from '@leather.io/services';
import { baseCurrencyAmountInQuote, createBtcBalance, createMoney } from '@leather.io/utils';

import { useMarketData } from '@app/query/common/market-data/market-data.query';

import { getBondFixture } from './bond-fixtures';
import { isBondMockAllowed, useBondScenario } from './bond-scenarios';

/**
 * Bonded BTC the current mock scenario adds on top of the real balances, in
 * both currencies. `undefined` when no scenario is active, so callers can
 * skip their transforms entirely.
 */
export function useMockLockedBtc(): { btc: Money; quote: Money } | undefined {
  const scenario = useBondScenario();
  const marketData = useMarketData(btcAsset);
  if (!isBondMockAllowed || scenario === 'none') return undefined;
  const btc = createMoney(getBondFixture(scenario).lockedSats, 'BTC');
  const quote =
    marketData.state === 'success'
      ? baseCurrencyAmountInQuote(btc, marketData.value)
      : createMoney(0, 'USD');
  return { btc, quote };
}

function addLocked<T extends AccountQuotedBtcBalance['btc']>(balance: T, locked: Money): T {
  return createBtcBalance(
    createMoney(balance.totalBalance.amount.plus(locked.amount), balance.totalBalance.symbol),
    balance.inboundBalance,
    balance.outboundBalance,
    balance.dustBalance,
    balance.unspendableBalance,
    createMoney(balance.lockedBalance.amount.plus(locked.amount), balance.lockedBalance.symbol)
  ) as T;
}

export function withMockLockedBtc(
  balance: AccountQuotedBtcBalance,
  locked: { btc: Money; quote: Money }
): AccountQuotedBtcBalance {
  return {
    ...balance,
    btc: addLocked(balance.btc, locked.btc),
    quote: addLocked(balance.quote, locked.quote),
  };
}

export function addMoney(base: Money, extra: Money): Money {
  return createMoney(base.amount.plus(extra.amount), base.symbol);
}
