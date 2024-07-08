import { useCallback } from 'react';

import { HDKey } from '@scure/bip32';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getTaprootAddress } from '@leather.io/bitcoin';
import { createNumArrayOfRange } from '@leather.io/utils';

import { useLeatherNetwork } from '../../leather-query-provider';
import { QueryPrefixes } from '../../query-prefixes';
import { useBestInSlotApiRateLimiter } from '../../rate-limiter/best-in-slot-limiter';
import { useBitcoinClient } from '../clients/bitcoin-client';

const stopSearchAfterNumberAddressesWithoutOrdinals = 5;
const addressesSimultaneousFetchLimit = 5;

const inscriptionsLazyLoadLimit = 20;

export function useBestInSlotGetInscriptionsInfiniteQuery({
  taprootKeychain,
  nativeSegwitAddress,
}: {
  nativeSegwitAddress: string;
  taprootKeychain: HDKey | undefined;
}) {
  const network = useLeatherNetwork();
  const limiter = useBestInSlotApiRateLimiter();
  const client = useBitcoinClient();
  const getTaprootAddressData = useCallback(
    (fromIndex: number, toIndex: number) => {
      return createNumArrayOfRange(fromIndex, toIndex - 1).reduce(
        (acc: Record<string, number>, i: number) => {
          const address = getTaprootAddress({
            index: i,
            keychain: taprootKeychain,
            network: network.chain.bitcoin.bitcoinNetwork,
          });
          acc[address] = i;
          return acc;
        },
        {}
      );
    },
    [taprootKeychain, network.chain.bitcoin.bitcoinNetwork]
  );

  const query = useInfiniteQuery({
    queryKey: [QueryPrefixes.GetInscriptions, 'bis', nativeSegwitAddress, network.id],
    async queryFn({ pageParam, signal }) {
      const responsesArr = [];
      let fromIndex = pageParam.fromIndex;
      let addressesWithoutOrdinalsNum = pageParam.addressesWithoutOrdinalsNum;
      let addressesMap = getTaprootAddressData(
        fromIndex,
        fromIndex + addressesSimultaneousFetchLimit
      );

      let addressesData = getTaprootAddressData(
        fromIndex,
        fromIndex + addressesSimultaneousFetchLimit
      );

      let offset = pageParam.offset;
      // Loop through addresses until we reach the limit, or until we find an address with many inscriptions
      while (addressesWithoutOrdinalsNum < stopSearchAfterNumberAddressesWithoutOrdinals) {
        const addresses = Object.keys(addressesData);

        // Add native segwit address to 1 chunk of addresses
        if (fromIndex === 0) {
          addresses.unshift(nativeSegwitAddress);
        }

        const response = await limiter.add(
          () =>
            client.BestinSlotApi.getInscriptionsByAddresses({
              addresses,
              offset,
              count: inscriptionsLazyLoadLimit,
              signal,
            }),
          {
            signal,
            throwOnTimeout: true,
          }
        );

        responsesArr.push(response);

        const inscriptionsNum = response.data.length;

        // Stop loop to dynamically fetch inscriptions from 1 address if there are many inscriptions
        if (inscriptionsNum === inscriptionsLazyLoadLimit) {
          addressesWithoutOrdinalsNum = 0;
          break;
        }

        // Case when we fetched all inscriptions from address with many inscriptions
        if (inscriptionsNum < inscriptionsLazyLoadLimit) {
          offset = 0;
        }

        fromIndex += addressesSimultaneousFetchLimit;
        addressesWithoutOrdinalsNum += addressesSimultaneousFetchLimit;

        addressesData = getTaprootAddressData(
          fromIndex,
          fromIndex + addressesSimultaneousFetchLimit
        );

        // Add new addresses to the map
        addressesMap = {
          ...addressesMap,
          ...addressesData,
        };

        if (inscriptionsNum > 0) {
          addressesWithoutOrdinalsNum = 0;
        }
      }

      const inscriptions = responsesArr.flatMap(response => response.data);

      return {
        offset,
        stopNextFetch: addressesWithoutOrdinalsNum >= stopSearchAfterNumberAddressesWithoutOrdinals,
        inscriptions,
        fromIndex,
        addressesWithoutOrdinalsNum,
        addressesMap,
      };
    },
    initialPageParam: {
      addressesMap: {},
      addressesWithoutOrdinalsNum: 0,
      fromIndex: 0,
      offset: 0,
    },
    getNextPageParam(lastPage) {
      const { offset, stopNextFetch, fromIndex, addressesWithoutOrdinalsNum, addressesMap } =
        lastPage;

      if (stopNextFetch) return undefined;

      // Calculate offset for next fetch
      const calculatedOffset = offset + inscriptionsLazyLoadLimit;

      return {
        offset: calculatedOffset,
        fromIndex,
        addressesWithoutOrdinalsNum,
        addressesMap,
      };
    },
    staleTime: 3 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: true,
  });

  return query;
}
