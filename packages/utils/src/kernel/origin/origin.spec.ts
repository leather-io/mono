import fc from 'fast-check';
import { describe, expect, test } from 'vitest';

import { isSameWebOrigin, webOrigin } from './origin';

const runs = 2000;
const defaultPorts: Record<string, number> = { http: 80, https: 443 };

const scheme = fc.constantFrom('http', 'https');
const host = fc.constantFrom(
  'example.com',
  'app.example.com',
  'example.org',
  'localhost',
  '127.0.0.1'
);
const port = fc.constantFrom(undefined, 80, 443, 3000, 8443);
const path = fc.constantFrom('', '/', '/a/b?c=d#e', '?x=1');
const site = fc.record({ scheme, host, port, path });

function urlOf({
  scheme,
  host,
  port,
  path,
}: {
  scheme: string;
  host: string;
  port?: number;
  path: string;
}) {
  return `${scheme}://${host}${port === undefined ? '' : `:${port}`}${path}`;
}

function effectivePort({ scheme, port }: { scheme: string; port?: number }) {
  return port ?? defaultPorts[scheme];
}

describe('web origin', () => {
  test('keeps scheme, host and port, and drops everything else', () => {
    expect(webOrigin('https://Example.com/path?query#hash')).toBe('https://example.com');
    expect(webOrigin('https://example.com:443')).toBe('https://example.com');
    expect(webOrigin('https://example.com:8443/x')).toBe('https://example.com:8443');
    expect(webOrigin('http://localhost:3000')).toBe('http://localhost:3000');
    expect(webOrigin('https://user:secret@example.com')).toBe('https://example.com');
  });

  test('tells apart sites that differ only in scheme or port', () => {
    expect(isSameWebOrigin('https://example.com', 'http://example.com')).toBe(false);
    expect(isSameWebOrigin('https://example.com', 'https://example.com:8443')).toBe(false);
    expect(isSameWebOrigin('https://example.com', 'https://sub.example.com')).toBe(false);
    expect(isSameWebOrigin('https://example.com/a', 'https://EXAMPLE.com:443/b')).toBe(true);
  });

  test.each([
    '',
    'null',
    'example.com',
    'file:///etc/passwd',
    'data:text/html,x',
    'javascript:alert(1)',
    'chrome-extension://abc/popup.html',
    'blob:https://example.com/1',
    'ftp://example.com',
    'https://',
    'about:blank',
  ])('refuses %j', url => {
    expect(() => webOrigin(url)).toThrow(RangeError);
  });
});

describe('web origin properties', () => {
  test('two urls share an origin exactly when scheme, host and port all match', () => {
    fc.assert(
      fc.property(site, site, (a, b) => {
        const same =
          a.scheme === b.scheme && a.host === b.host && effectivePort(a) === effectivePort(b);
        expect(isSameWebOrigin(urlOf(a), urlOf(b))).toBe(same);
      }),
      { numRuns: runs }
    );
  });

  test('an origin is already in its final form', () => {
    fc.assert(
      fc.property(site, a => {
        const origin = webOrigin(urlOf(a));
        expect(webOrigin(origin)).toBe(origin);
        expect(origin.startsWith(`${a.scheme}://${a.host}`)).toBe(true);
      }),
      { numRuns: runs }
    );
  });
});
