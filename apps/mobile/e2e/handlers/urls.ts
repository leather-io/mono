const queryOrEnd = '(\\?.*)?$';
const segment = '[^/?]+';

function urlPattern(origin: string, path: string) {
  return new RegExp(`^${origin}${path.replaceAll(':segment', segment)}${queryOrEnd}`);
}

export function leatherApiUrl(path: string) {
  return urlPattern('https://(staging\\.)?api\\.leather\\.io', path);
}

export function hiroUrl(path: string) {
  return urlPattern('https://api\\.(testnet\\.)?hiro\\.so', path);
}

export function mempoolUrl(path: string) {
  return urlPattern('https://(leather\\.)?mempool\\.space(/testnet4?|/signet)?/api', path);
}

export function bnsUrl(path: string) {
  return urlPattern('https://api\\.bnsv2\\.com(/testnet)?', path);
}

export function readPathSegment(url: string, index: number) {
  const segments = new URL(url).pathname.split('/').filter(part => part.length > 0);
  const segment = segments.at(index);
  if (segment === undefined) throw new Error(`No path segment ${index} in ${url}`);
  return decodeURIComponent(segment);
}

export function readSearchParam(url: string, name: string) {
  return new URL(url).searchParams.get(name);
}
