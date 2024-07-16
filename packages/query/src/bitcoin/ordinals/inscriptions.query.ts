import { useCallback, useEffect } from 'react';

import { HDKey } from '@scure/bip32';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

import { getTaprootAddress } from '@leather.io/bitcoin';
import {
  HIRO_INSCRIPTIONS_API_URL,
  WalletDefaultNetworkConfigurationIds,
} from '@leather.io/models';
import { createNumArrayOfRange, ensureArray } from '@leather.io/utils';

import type { InscriptionResponseHiro } from '../../../types/inscription';
import { useLeatherNetwork } from '../../leather-query-provider';
import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { useBestInSlotApiRateLimiter } from '../../rate-limiter/best-in-slot-limiter';
import { useHiroApiRateLimiter } from '../../rate-limiter/hiro-rate-limiter';
import { useBitcoinClient } from '../clients/bitcoin-client';

const stopSearchAfterNumberAddressesWithoutOrdinals = 5;
const addressesSimultaneousFetchLimit = 5;

// Hiro API max limit = 60
const inscriptionsLazyLoadLimit = 20;

interface InscriptionsQueryResponse {
  results: InscriptionResponseHiro[];
  limit: number;
  offset: number;
  total: number;
}

interface FetchInscriptionsArgs {
  addresses: string | string[];
  offset?: number;
  limit?: number;
  signal?: AbortSignal;
}

async function fetchInscriptions({
  addresses,
  offset = 0,
  limit = 60,
  signal,
}: FetchInscriptionsArgs) {
  const params = new URLSearchParams();
  ensureArray(addresses).forEach(address => params.append('address', address));
  params.append('limit', limit.toString());
  params.append('offset', offset.toString());

  const res = await axios.get<InscriptionsQueryResponse>(
    `${HIRO_INSCRIPTIONS_API_URL}?${params.toString()}`,
    {
      signal,
    }
  );

  return res.data;
}

/**
 * // TODO: Refactor: https://github.com/leather-io/issues/issues/109
 * Returns all inscriptions for the user's current account
 */
export function useGetInscriptionsInfiniteQuery({
  taprootKeychain,
  nativeSegwitAddress,
}: {
  nativeSegwitAddress: string;
  taprootKeychain: HDKey | undefined;
}) {
  const network = useLeatherNetwork();
  const limiter = useHiroApiRateLimiter();

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
    queryKey: [BitcoinQueryPrefixes.GetInscriptions, nativeSegwitAddress, network.id],
    async queryFn({ pageParam, signal }) {
      const responsesArr: InscriptionsQueryResponse[] = [];
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
            fetchInscriptions({
              addresses,
              offset,
              limit: inscriptionsLazyLoadLimit,
              signal,
            }),
          {
            signal,
            throwOnTimeout: true,
          }
        );

        responsesArr.push(response);

        // Stop loop to dynamically fetch inscriptions from 1 address if there are many inscriptions
        if (response.total > inscriptionsLazyLoadLimit && response.results.length > 0) {
          addressesWithoutOrdinalsNum = 0;
          break;
        }

        // Case when we fetched all inscriptions from address with many inscriptions
        if (response.total === 0 && response.offset > 0) {
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
        if (response.results.length > 0) {
          addressesWithoutOrdinalsNum = 0;
        }
      }

      const inscriptions = responsesArr.flatMap(response => response.results);

      // Get offset and total from the last response
      const total = responsesArr[responsesArr.length - 1]?.total;

      return {
        offset,
        total,
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
      total: 0,
    },
    getNextPageParam(lastPage) {
      const { offset, total, stopNextFetch, fromIndex, addressesWithoutOrdinalsNum, addressesMap } =
        lastPage;
      if (stopNextFetch) return undefined;

      // Calculate offset for next fetch
      let calculatedOffset = offset + inscriptionsLazyLoadLimit;

      if (offset + inscriptionsLazyLoadLimit > total) {
        calculatedOffset = offset + (total - offset);
      }

      return {
        offset: calculatedOffset,
        total,
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

const bestinslotInscriptionsRequestNum = 2000;

export function useInscriptionsByAddressQuery(address: string) {
  const network = useLeatherNetwork();
  const client = useBitcoinClient();
  const limiter = useBestInSlotApiRateLimiter();

  const query = useInfiniteQuery({
    enabled: !!address,
    queryKey: [BitcoinQueryPrefixes.InscriptionsByAddress, network.id, address],
    async queryFn({ pageParam, signal }) {
      const res = await limiter.add(
        () =>
          client.BestinSlotApi.getInscriptionsByAddress({
            address,
            network: network.id as WalletDefaultNetworkConfigurationIds,
            offset: pageParam,
            signal,
            count: bestinslotInscriptionsRequestNum,
          }),
        { signal, throwOnTimeout: true }
      );

      return {
        offset: pageParam,
        data: res.data,
      };
    },
    initialPageParam: 0,
    getNextPageParam(lastPage) {
      if (!address) return undefined;
      if (lastPage.data.length < bestinslotInscriptionsRequestNum) return undefined;
      return lastPage.offset + bestinslotInscriptionsRequestNum;
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  // Auto-trigger next request
  useEffect(() => {
    if (!address) return;
    void query.fetchNextPage();
  }, [address, query, query.data]);

  return query;
}

// In lieu of reliable API, we scrape HTML from the Ordinals.com explorer and
// parses the HTML
// Example:
// https://ordinals.com/output/758bd2703dd9f0a2df31c2898aecf6caba05a906498c9bc076947f9fc4d8f081:0
async function getOrdinalsComTxOutputHtmlPage(id: string, index: number) {
  const resp = await axios.get(`https://ordinals-explorer.generative.xyz/output/${id}:${index}`);
  return new DOMParser().parseFromString(resp.data, 'text/html');
}

export async function getNumberOfInscriptionOnUtxoUsingOrdinalsCom(id: string, index: number) {
  const utxoPage = await getOrdinalsComTxOutputHtmlPage(id, index);

  // First content on page is inscrption section header and thumbnail of
  // inscrptions in utxo
  const firstSectionHeader = utxoPage.querySelector('dl > dt:first-child');
  if (!firstSectionHeader)
    throw new Error('If no element matching this selector is found, something is wrong');

  const firstHeaderText = firstSectionHeader.textContent;
  const thumbnailCount = utxoPage.querySelectorAll('dl > dt:first-child + dd.thumbnails a').length;

  // Were HTML to page to change, thumbnailCount alone would dangerously return
  // zero 0, hence additional check that inscrption header is also missing
  if (thumbnailCount === 0 && firstHeaderText !== 'inscriptions') return 0;

  return thumbnailCount;
}
