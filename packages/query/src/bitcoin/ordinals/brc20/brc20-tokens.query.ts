import { useCallback, useEffect } from 'react';

import { P2TROut } from '@scure/btc-signer/payment';
import { useInfiniteQuery } from '@tanstack/react-query';

import type { Signer } from '@leather-wallet/bitcoin';
import { createNumArrayOfRange } from '@leather-wallet/utils';

import { useLeatherNetwork } from '../../../leather-query-provider';
import { QueryPrefixes } from '../../../query-prefixes';
import { useBitcoinClient } from '../../bitcoin-client';

const addressesSimultaneousFetchLimit = 3;
const stopSearchAfterNumberAddressesWithoutBrc20Tokens = 3;

export function useGetBrc20TokensQuery({
  nativeSegwitAddress,
  createTaprootSigner,
}: {
  nativeSegwitAddress: string;
  createTaprootSigner: ((addressIndex: number) => Signer<P2TROut>) | undefined;
}) {
  const network = useLeatherNetwork();
  const currentNsBitcoinAddress = nativeSegwitAddress;
  const client = useBitcoinClient();

  if (!createTaprootSigner) throw new Error('No signer');

  const getNextTaprootAddressBatch = useCallback(
    (fromIndex: number, toIndex: number) => {
      return createNumArrayOfRange(fromIndex, toIndex - 1).map(num => {
        const address = createTaprootSigner(num).address;
        return address;
      });
    },
    [createTaprootSigner]
  );

  const query = useInfiniteQuery({
    queryKey: [QueryPrefixes.GetBrc20Tokens, currentNsBitcoinAddress, network.id],
    async queryFn({ pageParam }) {
      const fromIndex = pageParam.fromIndex;
      let addressesWithoutTokens = pageParam.addressesWithoutTokens;

      const addressesData = getNextTaprootAddressBatch(
        fromIndex,
        fromIndex + addressesSimultaneousFetchLimit
      );

      if (fromIndex === 0) {
        addressesData.unshift(currentNsBitcoinAddress);
      }

      const brc20TokensPromises = addressesData.map(async address => {
        const brc20Tokens = await client.BestinSlotApi.getBrc20Balances(address);

        const tickerPromises = await Promise.all(
          brc20Tokens.data.map(token => {
            return client.BestinSlotApi.getBrc20TickerInfo(token.ticker);
          })
        );

        return brc20Tokens.data.map((token, index) => {
          return {
            balance: token,
            holderAddress: address,
            info: tickerPromises[index].data,
          };
        });
      });

      const brc20Tokens = await Promise.all(brc20TokensPromises).catch(error => {
        // TODO: add analytics here
        // eslint-disable-next-line no-console
        console.log('Error fetching BRC-20 tokens:', error);
        return [];
      });
      addressesWithoutTokens += brc20Tokens.filter(tokens => tokens.length === 0).length;

      return {
        addressesWithoutTokens,
        brc20Tokens,
        fromIndex,
      };
    },
    initialPageParam: {
      addressesWithoutTokens: 0,
      fromIndex: 0,
    },
    getNextPageParam(lastPage) {
      const { fromIndex, brc20Tokens, addressesWithoutTokens } = lastPage;

      if (addressesWithoutTokens >= stopSearchAfterNumberAddressesWithoutBrc20Tokens) {
        return undefined;
      }

      return {
        addressesWithoutTokens,
        brc20Tokens,
        fromIndex: fromIndex + addressesSimultaneousFetchLimit,
      };
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000,
  });

  // Auto-trigger next request
  useEffect(() => {
    if (query.hasNextPage) {
      void query.fetchNextPage();
    }
  }, [query, query.data]);

  return query;
}
