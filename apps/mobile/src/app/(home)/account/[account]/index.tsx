import { useEffect, useState } from 'react';

import { MockedAccount } from '@/mocks/account.mocks';
import { mockTotalBalance } from '@/mocks/balance.mocks';
import { AccountLoader } from '@/store/accounts/accounts';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import {
  useCryptoCurrencyMarketDataMeanAverage,
  useGetBnsNamesOwnedByAddressQuery,
  useNativeSegwitBalance,
  useStacksAccountBalanceFungibleTokens,
  useStx20Tokens,
  useStxCryptoAssetBalance,
  useTotalBalance,
} from '@leather.io/query';
import { Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney, i18nFormatCurrency } from '@leather.io/utils';

import { AccountLayout } from './account.layout';

const configureAccountParamsSchema = z.object({
  fingerprint: z.string(),
  account: z.string().transform(value => Number(value)),
});

const network = {
  id: 'mainnet',
  name: 'Mainnet',
  chain: {
    stacks: {
      blockchain: 'stacks',
      chainId: 1,
      url: 'https://api.hiro.so',
    },
    bitcoin: {
      blockchain: 'bitcoin',
      bitcoinNetwork: 'mainnet',
      bitcoinUrl: 'https://leather.mempool.space/api',
    },
  },
};

const PollingComponent = () => {
  const [polling, setPolling] = useState(true);
  const { data, error, isError, isPending } = useStx20Tokens(
    'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA'
  );

  useEffect(() => {
    if (!polling) return;

    const intervalId = setInterval(() => {
      console.log('polling');
      if (data) {
        console.log('Data received:', data);
        setPolling(false); // Stop polling when data is received
      }

      console.log(
        '*************************************** tokens',
        data,
        error,
        isError,
        isPending
      );
    }, 1000); // Poll every 1000 milliseconds (1 second)

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [data, polling]);

  return (
    <Box>
      <Text>Pete</Text>
      {data ? <Text>Data: {JSON.stringify(data)}</Text> : <Text>Loading...</Text>}
    </Box>
  );
};

export default function AccountScreen() {
  const params = useLocalSearchParams();

  // const { data: tokens = [] } = useStx20Tokens('SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA');
  // console.log('*************************************** tokens', tokens);
  // this just returns nothing
  const { fingerprint, account: accountIndex } = configureAccountParamsSchema.parse(params);
  // // get stx balance
  // const { filteredBalanceQuery, isLoadingAdditionalData: isLoadingAdditionalDataStxBalance } =
  //   useStxCryptoAssetBalance('SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW');
  // const { data: tokens = {} } = useStacksAccountBalanceFungibleTokens(
  //   'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW'
  // );

  // const names = useGetBnsNamesOwnedByAddressQuery('SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW').data
  //   ?.names;
  // console.log(
  //   '***************************************',
  //   filteredBalanceQuery,
  //   // isLoadingAdditionalDataStxBalance,
  //   tokens,
  //   names
  // );

  // // > try get useStx20Tokens to work without polyfill

  // const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  // const {
  //   data: balance,
  //   isFetching: isFetchingStxBalance,
  //   isLoading: isLoadingStxBalance,
  //   isPending: isPendingStxBalance,
  // } = filteredBalanceQuery;

  // const stxBalance = balance ? balance.totalBalance : createMoney(0, 'STX');
  const stxBalance = createMoney(0, 'STX');

  // const stxUsdAmount = baseCurrencyAmountInQuote(stxBalance, stxMarketData);
  // console.log('***************************************', balance);

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => (
        <AccountLayout balance={stxBalance} account={account as MockedAccount}>
          <PollingComponent />
          <Text>nothing to see</Text>
        </AccountLayout>
      )}
    </AccountLoader>
  );
}
