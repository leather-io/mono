import { AccountStore } from '@/store/accounts/utils';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';

import { Money } from '@leather.io/models';
// import { destructAccountIdentifier } from '@/store/utils';
import { useStxBalancesQueries } from '@leather.io/query';
import {
  useCryptoCurrencyMarketDataMeanAverage,
  useStxCryptoAssetBalance,
} from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

interface StxBalance {
  stxBalance: Money;
  stxBalanceUsd: Money;
  combinedBalances: unknown | null;
}

// function useGetStxAddresses(accounts: AccountStore[]): string[] {
//   const signers = useStacksSigners();
//   return accounts.map(account => account?.fingerprint ?? '');
// }

function GetAccountStxBalance(fingerprint: string): Money {
  const signers = useStacksSigners().fromFingerprint(fingerprint);
  const [stacksSigner] = signers;
  const stacksAddress = stacksSigner?.address;
  const {
    filteredBalanceQuery: { data: balance },
  } = useStxCryptoAssetBalance(stacksAddress ?? '');

  return balance ? balance.totalBalance : createMoney(0, 'STX');
}

function useGetAccountsStxBalance(accounts: AccountStore[]): {
  totalStxBalance: Money;
  combinedBalances: unknown | null;
} {
  if (!accounts || accounts.length === 0)
    return { totalStxBalance: createMoney(0, 'STX'), combinedBalances: null };

  const signers = useStacksSigners();
  const stacksAddresses = signers.list.map(signer => signer.address);
  const balances = useStxBalancesQueries(stacksAddresses);

  console.log('balances ', balances);
  console.log('balances totalData', balances.totalData);
  return {
    totalStxBalance: accounts.reduce(
      (total, account) => sumMoney([total, GetAccountStxBalance(account?.fingerprint ?? '')]),
      createMoney(0, 'STX')
    ),
    combinedBalances: balances,
  };
}
// this really just needs an array of addresses
export function useStxBalance(accounts: AccountStore[]): StxBalance {
  // refactor this to be a hook that takes an array of addresses once combine and hook are done
  const { totalStxBalance, combinedBalances } = useGetAccountsStxBalance(accounts);
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const stxBalanceUsd = baseCurrencyAmountInQuote(totalStxBalance, stxMarketData);
  return { stxBalance: totalStxBalance, stxBalanceUsd, combinedBalances };
}
