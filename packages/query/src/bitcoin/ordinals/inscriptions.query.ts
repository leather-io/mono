import axios from 'axios';

import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient } from '../clients/bitcoin-client';
import { createInscriptionByXpubQueryKey } from './ordinals.utils';

export function createGetInscriptionsByAddressCacheKey(address: string, networkId: string) {
  return [BitcoinQueryPrefixes.GetInscriptionsByAddress, networkId, address];
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

export function createInscriptionByXpubQuery(client: BitcoinClient, xpub: string) {
  return {
    queryKey: createInscriptionByXpubQueryKey(xpub),
    queryFn: () => client.BestInSlotApi.getInscriptionsByXpub(xpub),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  } as const;
}
