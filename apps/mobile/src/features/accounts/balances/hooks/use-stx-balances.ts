import { Money } from '@leather.io/models';
// import { destructAccountIdentifier } from '@/store/utils';
import { useStxBalancesQueries } from '@leather.io/query';
import { useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

interface StxBalance {
  stxBalance: Money;
  stxBalanceUsd: Money;
}

interface StxBalances {
  totalStxBalance: Money;
}

function useGetAccountsStxBalance(stacksAddresses: string[]): StxBalances {
  if (!stacksAddresses || stacksAddresses.length === 0)
    return { totalStxBalance: createMoney(0, 'STX') };

  const balances = useStxBalancesQueries(stacksAddresses);

  console.log('balances ', balances);
  console.log('balances totalData', balances.totalData);
  return {
    totalStxBalance: balances.totalData,
  };
}
// this really just needs an array of addresses
export function useStxBalance(stacksAddresses: string[]): StxBalance {
  // refactor this to be a hook that takes an array of addresses once combine and hook are done
  const { totalStxBalance } = useGetAccountsStxBalance(stacksAddresses);
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const stxBalanceUsd = baseCurrencyAmountInQuote(totalStxBalance, stxMarketData);
  return { stxBalance: totalStxBalance, stxBalanceUsd };
}
