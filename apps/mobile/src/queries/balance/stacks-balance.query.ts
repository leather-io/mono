import { useCallback } from 'react';

import { useMempoolTxsBalance } from '@/queries/stacks/use-mempool-txs-balance';
import { useQueries } from '@tanstack/react-query';

import { Money } from '@leather.io/models';
import {
  AddressBalanceResponse,
  createGetStacksAccountBalanceQueryOptions,
  createStxCryptoAssetBalance,
  createStxMoney,
  useCryptoCurrencyMarketDataMeanAverage,
  useCurrentNetworkState,
  useStacksClient,
} from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney, sumMoney } from '@leather.io/utils';

import { useStxMarketDataQuery } from '../market-data/stx-market-data.query';

// import { useStxMarketDataQuery } from '../market-data/stx-market-data.query';

interface StxBalances {
  totalStxBalance: Money;
}

function useGetStxBalanceByAddresses(addresses: string[]): StxBalances {
  const { totalData } = useStxBalancesQueries(addresses);

  if (!addresses || addresses.length === 0) return { totalStxBalance: createMoney(0, 'STX') };

  return {
    totalStxBalance: totalData,
  };
}

function useStxBalancesQueries(addresses: string[]) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();

  const { inboundBalance, outboundBalance } = useMempoolTxsBalance(addresses);
  const queries = useQueries({
    queries: addresses.map(address => ({
      ...createGetStacksAccountBalanceQueryOptions({
        address,
        client,
        network: network.chain.stacks.url,
      }),
      select: (resp: AddressBalanceResponse) => {
        const initialBalance = createStxMoney(resp);
        return createStxCryptoAssetBalance(initialBalance, inboundBalance, outboundBalance);
      },
    })),
  });

  const combinedResult = useCallback(
    () => ({
      queries,
      totalData: queries
        .map(result => result.data)
        .reduce(
          (total, data) => sumMoney([total, data?.totalBalance ?? createMoney(0, 'STX')]),
          createMoney(0, 'STX')
        ),
      pending: queries.some(result => result.isPending),
    }),
    [queries]
  );

  return combinedResult();
}

export function useStxBalance(addresses: string[]) {
  if (addresses.length === 0)
    return { availableBalance: createMoney(0, 'STX'), fiatBalance: createMoney(0, 'USD') };
  const { totalStxBalance: availableBalance } = useGetStxBalanceByAddresses(addresses);
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const fiatBalance = baseCurrencyAmountInQuote(availableBalance, stxMarketData);
  console.log('useStxBalance', addresses, 'availableBalance', availableBalance);

  const { data: newStxMarketData } = useStxMarketDataQuery();
  const newStxBalanceUsd = newStxMarketData
    ? baseCurrencyAmountInQuote(availableBalance, newStxMarketData)
    : createMoney(0, 'USD');
  // FIXME - marketDataService isn't returning the correct precision for STX balances
  // {"amount": "712850366", "decimals": 6, "symbol": "STX"}
  console.log('STX availableBalance', availableBalance);
  console.log('stxMarketData', stxMarketData, 'fiatBalance', fiatBalance);
  console.log('newStxMarketData', newStxMarketData, 'newStxBalanceUsd', newStxBalanceUsd);
  // new market data returns  {"pair": {"base": "STX", "quote": "USD"}, "price": {"amount": "1.87909449777537473333", "decimals": 2, "symbol": "USD"}} newStxBalanceUsd {"amount": "1248.37076788534840688371397671", "decimals": 2, "symbol": "USD"}
  // old market data returns {"pair": {"base": "STX", "quote": "USD"}, "price": {"amount": "187.90944977753747666667", "decimals": 2, "symbol": "USD"}} fiatBalance {"amount": "124837.07678853484290308501782329", "decimals": 2, "symbol": "USD"}
  return { availableBalance, fiatBalance };
}
