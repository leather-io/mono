import { useEffect, useState } from 'react';

import { MockedAccount } from '@/mocks/account.mocks';
// import { mockTotalBalance } from '@/mocks/balance.mocks';
import { AccountLoader } from '@/store/accounts/accounts';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import {
  // useCryptoCurrencyMarketDataMeanAverage,
  // useGetBnsNamesOwnedByAddressQuery,
  // useNativeSegwitBalance,
  // useStacksAccountBalanceFungibleTokens,
  // stacksClient,
  useStx20Tokens,
  useStxCryptoAssetBalance, // useTotalBalance,
} from '@leather.io/query';
import { Box, Text } from '@leather.io/ui/native';
// import { baseCurrencyAmountInQuote, createMoney, i18nFormatCurrency } from '@leather.io/utils';
import { createMoney } from '@leather.io/utils';

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

      // console.log(
      //   '*************************************** tokens',
      //   data,
      //   error,
      //   isError,
      //   isPending
      // );
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
  // const client = stacksClient(network.chain.stacks.url);
  const stxAddress = 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW';

  // const { data: tokens = [] } = useStx20Tokens('SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA');
  // this just returns nothing
  const { fingerprint, account: accountIndex } = configureAccountParamsSchema.parse(params);
  // // get stx balance
  const { filteredBalanceQuery, isLoadingAdditionalData: isLoadingAdditionalDataStxBalance } =
    useStxCryptoAssetBalance(stxAddress);
  // const { data: tokens = {} } = useStacksAccountBalanceFungibleTokens(
  //   stxAddress
  // );

  // const names = useGetBnsNamesOwnedByAddressQuery(stxAddress).data
  //   ?.names;
  console.log(
    '***************************************',
    filteredBalanceQuery,
    isLoadingAdditionalDataStxBalance
    // tokens,
    // names
  );
  const controller = new AbortController();

  async function getAccountBalance(address: string) {
    const resp = axios.get(`${network.chain.stacks.url}/extended/v1/address/${address}/balances`, {
      signal: controller.signal,
    });

    // still hitting React Query error  [TypeError: options.signal?.throwIfAborted is not a function (it is undefined)]
    // take a slight break to gather thoughts and organise project milestonges

    // console.log('============ getAccountBalance', address, resp);
    return resp;
  }

  // const response = await getAccountBalance(stxAddress);
  // // > try get useStx20Tokens to work without polyfill

  useEffect(() => {
    const fetchBalance = async () => {
      const response = await getAccountBalance(stxAddress);
      console.log('-------- manual balance', response);
      // Handle the response as needed
    };

    fetchBalance();
  }, [stxAddress]);
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
          <Box>
            <Text>nothing to see</Text>
          </Box>
        </AccountLayout>
      )}
    </AccountLoader>
  );
}
