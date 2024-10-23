import { AccountStore } from '@/store/accounts/utils';

import { Money } from '@leather.io/models';
import { useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

import { useStxBalance } from './use-stx-balances';

interface TotalBalance {
  btcBalance: Money;
  btcBalanceUsd: Money;
  stxBalance: Money;
  stxBalanceUsd: Money;
  totalBalance: Money;
  combinedBalances:
    | {
        pending: boolean;
        totalData: Money;
      }
    | null
    | unknown;
  combinedBalancesUsd?: Money | null;
}
export function useTotalBalance(accounts: AccountStore[]): TotalBalance {
  const { stxBalance, combinedBalances } = useStxBalance(accounts);
  // FIXME - add real BTC balance
  const btcBalance = createMoney(0, 'BTC');
  // FIXME - useCryptoCurrencyMarketDataMeanAverage uses only USD
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const btcBalanceUsd = baseCurrencyAmountInQuote(btcBalance, btcMarketData);
  const stxBalanceUsd = baseCurrencyAmountInQuote(stxBalance, stxMarketData);
  console.log('combinedBalances', combinedBalances.totalData);
  console.log('stxBalance', stxBalance);
  const combinedBalancesUsd = baseCurrencyAmountInQuote(
    (combinedBalances?.totalData as Money) ?? createMoney(0, 'STX'),
    stxMarketData
  );
  const totalBalance = sumMoney([btcBalanceUsd, stxBalanceUsd]);
  return {
    btcBalance,
    btcBalanceUsd,
    stxBalance,
    stxBalanceUsd,
    totalBalance,
    combinedBalances,
    combinedBalancesUsd,
  };
}
