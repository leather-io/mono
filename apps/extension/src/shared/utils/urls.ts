import { isWebUri } from 'valid-url';

const webProtocols = new Set(['http:', 'https:']);

export function isValidUrl(str: string) {
  return !!isWebUri(str);
}

export function getOriginFromUrl(origin: string) {
  const url = new URL(origin);
  if (!url.hostname || !webProtocols.has(url.protocol)) throw new Error('Invalid URL: ' + origin);
  return url.origin;
}
