import { AccountStore } from '@/store/accounts/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { destructAccountIdentifier } from '@/store/utils';

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

function GetAccountStxBalance(accountId: string): Money {
  const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
  const signers = useStacksSigners().fromAccountIndex(fingerprint, accountIndex);
  const stxAddress = signers[0]?.address;
  const {
    filteredBalanceQuery: { data: balance },
  } = useStxCryptoAssetBalance(stxAddress ?? '');

  return balance ? balance.totalBalance : createMoney(0, 'STX');
}

function useGetAccountsStxBalance(accounts: AccountStore[]): Money {
  if (!accounts.length) return createMoney(0, 'STX');

  return accounts.reduce(
    (total, account) => sumMoney([total, GetAccountStxBalance(account.id)]),
    createMoney(0, 'STX')
  );
}

export function useStxBalance(accounts: AccountStore[]): StxBalance {
  const totalStxBalance = useGetAccountsStxBalance(accounts);
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const stxBalanceUsd = baseCurrencyAmountInQuote(totalStxBalance, stxMarketData);
  return { stxBalance: totalStxBalance, stxBalanceUsd };
}
