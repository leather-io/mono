import { useEffect } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';

import { useLeatherNetwork } from '../../leather-query-provider';
import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { useBestInSlotApiRateLimiter } from '../../rate-limiter/best-in-slot-limiter';
import { useBitcoinClient } from '../clients/bitcoin-client';

const bestinslotInscriptionsRequestNum = 2000;

export function useGetInscriptionsByAddressQuery(address: string) {
  const network = useLeatherNetwork();
  const client = useBitcoinClient();
  const limiter = useBestInSlotApiRateLimiter();

  const query = useInfiniteQuery({
    enabled: !!address,
    queryKey: [BitcoinQueryPrefixes.GetInscriptionsByAddress, network.id, address],
    async queryFn({ pageParam, signal }) {
      const res = await limiter.add(
        () =>
          client.BestInSlotApi.getInscriptionsByAddress({
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
