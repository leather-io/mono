const webProtocols = ['http:', 'https:'];

function refuse(): RangeError {
  return new RangeError('Not an http or https origin.');
}

function parseUrl(text: string): URL {
  try {
    return new URL(text);
  } catch {
    throw refuse();
  }
}

export function webOrigin(url: string): string {
  if (typeof url !== 'string') throw new TypeError('URL must be a string.');
  const parsed = parseUrl(url);
  if (!webProtocols.includes(parsed.protocol) || parsed.hostname === '') throw refuse();
  return parsed.origin;
}

export function isSameWebOrigin(first: string, second: string): boolean {
  return webOrigin(first) === webOrigin(second);
}
