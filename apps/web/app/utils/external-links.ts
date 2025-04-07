import urljoin from 'url-join';
import { isWebUri } from 'valid-url';

import { HIRO_EXPLORER_URL } from '@leather.io/constants';

export function openExternalLink(url: string) {
  if (!isWebUri(url)) return;
  return window.open(url, '_blank', 'noopener,noreferrer');
}

const utmSource = 'utm_source=stacking-app';

function makeExplorerLink(path: string, network: string) {
  return urljoin(HIRO_EXPLORER_URL, `${path}?${utmSource}&chain=${network}`);
}

export function makeExplorerTxLink(txId: string, network: string) {
  return makeExplorerLink(`/txid/${txId}`, network);
}
