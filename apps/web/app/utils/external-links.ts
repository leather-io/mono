import urljoin from 'url-join';
import { isWebUri } from 'valid-url';
import { analytics } from '~/utils/analytics/analytics';

import { HIRO_EXPLORER_URL } from '@leather.io/constants';

/** Reports an external link click; use for plain `<a target="_blank">` links too. */
export function trackExternalLinkClick(url: string, properties?: Record<string, string>) {
  analytics.untypedTrack('external_link_clicked', {
    url,
    location: window.location.href,
    ...properties,
  });
}

export function openExternalLink(url: string) {
  if (!isWebUri(url)) return;
  trackExternalLinkClick(url);
  return window.open(url, '_blank', 'noopener,noreferrer');
}

const utmSource = 'utm_source=stacking-app';

function makeExplorerLink(path: string, network: string, apiUrl?: string) {
  const api = apiUrl ? `&api=${encodeURIComponent(apiUrl)}` : '';
  return urljoin(HIRO_EXPLORER_URL, `${path}?${utmSource}&chain=${network}${api}`);
}

export function makeExplorerTxLink(txId: string, network: string, apiUrl?: string) {
  return makeExplorerLink(`/txid/${txId}`, network, apiUrl);
}
