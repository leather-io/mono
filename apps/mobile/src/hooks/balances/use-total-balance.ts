import { MockedAccount } from '@/mocks/account.mocks';

import { Money } from '@leather.io/models';
import { useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

import { useStxBalance } from './use-stx-balances';

export function useTotalBalance(accounts: MockedAccount[]): Money {
  const totalStxBalance = () => {
    if (!accounts.length) return createMoney(0, 'STX');

    return accounts.reduce(
      (total, account) => {
        const accountBalance = useStxBalance(account.fingerprint, account.accountIndex);
        return sumMoney([total, accountBalance]);
      },
      createMoney(0, 'STX')
    );
  };

  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const totalUsdBalance = baseCurrencyAmountInQuote(totalStxBalance(), stxMarketData);
  return totalUsdBalance;
}
