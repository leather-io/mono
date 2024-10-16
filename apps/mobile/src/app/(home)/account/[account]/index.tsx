import { MockedAccount } from '@/mocks/account.mocks';
import { AccountLoader } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import {
  useCryptoCurrencyMarketDataMeanAverage,
  useStxCryptoAssetBalance,
} from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { AccountLayout } from './account.layout';

const configureAccountParamsSchema = z.object({
  fingerprint: z.string(),
  account: z.string().transform(value => Number(value)),
});

export default function AccountScreen() {
  const params = useLocalSearchParams();
  // Pete - get this from the account
  const stxAddress = 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW';

  const { filteredBalanceQuery } = useStxCryptoAssetBalance(stxAddress);
  const { fingerprint, account: accountIndex } = configureAccountParamsSchema.parse(params);

  // Logic is coming from useTotalBalance in extension which needs to be shared
  // BUT when digging into BTC balances sends you down a loop of hooks using redux and the account store
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');

  const balance = filteredBalanceQuery.data;
  const stxBalance = balance ? balance.totalBalance : createMoney(0, 'STX');

  const stxUsdAmount = baseCurrencyAmountInQuote(stxBalance, stxMarketData);
  // PETE show stxBalance in tokens widget!
  // get STX address from account data
  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <AccountLayout balance={stxUsdAmount} account={account as MockedAccount} />}
    </AccountLoader>
  );
}
