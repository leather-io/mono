import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

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
}
export function useTotalBalance(): TotalBalance {
  const signers = useStacksSigners();
  const stacksAddresses = signers.list.map(signer => signer.address);
  const { stxBalance } = useStxBalance(stacksAddresses);
  // FIXME - add real BTC balance
  const btcBalance = createMoney(0, 'BTC');
  // FIXME - useCryptoCurrencyMarketDataMeanAverage uses only USD
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const btcMarketData = useCryptoCurrencyMarketDataMeanAverage('BTC');
  const btcBalanceUsd = baseCurrencyAmountInQuote(btcBalance, btcMarketData);
  const stxBalanceUsd = baseCurrencyAmountInQuote(stxBalance, stxMarketData);
  console.log('stxBalance', stxBalance);

  const totalBalance = sumMoney([btcBalanceUsd, stxBalanceUsd]);
  return {
    btcBalance,
    btcBalanceUsd,
    stxBalance,
    stxBalanceUsd,
    totalBalance,
  };
}
