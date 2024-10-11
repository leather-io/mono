import { MockedAccount } from '@/mocks/account.mocks';
import { mockTotalBalance } from '@/mocks/balance.mocks';
import { AccountLoader } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import {
  useCryptoCurrencyMarketDataMeanAverage,
  useStacksAccountBalanceFungibleTokens,
  useStxCryptoAssetBalance,
} from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney, i18nFormatCurrency } from '@leather.io/utils';

import { AccountLayout } from './account.layout';

const configureAccountParamsSchema = z.object({
  fingerprint: z.string(),
  account: z.string().transform(value => Number(value)),
});

export default function AccountScreen() {
  const params = useLocalSearchParams();
  const { fingerprint, account: accountIndex } = configureAccountParamsSchema.parse(params);
  // get stx balance
  const { filteredBalanceQuery, isLoadingAdditionalData: isLoadingAdditionalDataStxBalance } =
    useStxCryptoAssetBalance('SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW');
  const { data: tokens = {} } = useStacksAccountBalanceFungibleTokens(
    'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW'
  );

  console.log(
    '***************************************',
    filteredBalanceQuery,
    isLoadingAdditionalDataStxBalance,
    tokens
  );

  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const {
    data: balance,
    isFetching: isFetchingStxBalance,
    isLoading: isLoadingStxBalance,
    isPending: isPendingStxBalance,
  } = filteredBalanceQuery;

  const stxBalance = balance ? balance.totalBalance : createMoney(0, 'STX');

  const stxUsdAmount = baseCurrencyAmountInQuote(stxBalance, stxMarketData);
  console.log('***************************************', balance);

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => <AccountLayout balance={stxUsdAmount} account={account as MockedAccount} />}
    </AccountLoader>
  );
}
