import { MockedAccount } from '@/mocks/account.mocks';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

import { Money } from '@leather.io/models';
import {
  useCryptoCurrencyMarketDataMeanAverage,
  useStxCryptoAssetBalance,
} from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

interface StxBalance {
  stxBalance: Money;
  stxBalanceUsd: Money;
}

function useGetAccountStxBalance(account: MockedAccount): Money {
  const signers = useStacksSigners().fromAccountIndex(account.fingerprint, account.accountIndex);
  const stxAddress = signers[0]?.address;
  const {
    filteredBalanceQuery: { data: balance },
  } = useStxCryptoAssetBalance(stxAddress ?? '');

  return balance ? balance.totalBalance : createMoney(0, 'STX');
}

function useGetAccountsStxBalance(accounts: MockedAccount[]): Money {
  if (!accounts.length) return createMoney(0, 'STX');

  return accounts.reduce(
    (total, account) => sumMoney([total, useGetAccountStxBalance(account)]),
    createMoney(0, 'STX')
  );
}

export function useStxBalance(accounts: MockedAccount[]): StxBalance {
  const totalStxBalance = useGetAccountsStxBalance(accounts);
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const stxBalanceUsd = baseCurrencyAmountInQuote(totalStxBalance, stxMarketData);
  return { stxBalance: totalStxBalance, stxBalanceUsd };
}
