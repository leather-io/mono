// @ts-ignore
import bigListOfNaughtyStrings from 'blns';

import { getOriginFromUrl, isValidUrl } from './urls';

describe('isValidUrl', () => {
  test('accepts normal URLs', () => {
    const normal = [
      'http://example.com',
      'https://blockstack.com/asdf?hey=true',
      'https://blockstack.org/asdf#anchor',
    ];

    normal.forEach(url => {
      expect(isValidUrl(url)).toEqual(true);
    });
  });

  test('rejects non http(s) schemas', () => {
    // one of the strings is a actual url
    const naughtyStrings = (bigListOfNaughtyStrings as string[]).filter(
      str => !str.startsWith('http')
    );
    const bad = [
      ...naughtyStrings,
      'javascript:alert("hello")//',
      'web.org',
      'javascript:console.log();',
      'javascripT:console.log();',
      'JaVascRipt:console.log();',
    ];

    bad.forEach(url => {
      expect(isValidUrl(url)).toEqual(false);
    });
  });
});

describe('getOriginFromUrl', () => {
  test.each([
    ['HTTPS://EXAMPLE.COM:443/path?query=value#fragment', 'https://example.com'],
    ['http://example.com:80/path', 'http://example.com'],
    ['https://example.com:8443/path', 'https://example.com:8443'],
    ['http://localhost:3000/path', 'http://localhost:3000'],
  ])('returns the canonical web origin of %s', (url, expected) => {
    expect(getOriginFromUrl(url)).toEqual(expected);
  });

  test('keeps different schemes and non-default ports isolated', () => {
    expect(getOriginFromUrl('https://example.com')).not.toEqual(
      getOriginFromUrl('http://example.com')
    );
    expect(getOriginFromUrl('https://example.com')).not.toEqual(
      getOriginFromUrl('https://example.com:8443')
    );
  });

  test.each([
    'not-a-url',
    'file:////path/name',
    'data:text/plain,value',
    'about:blank',
    'javascript:void(0)',
  ])('throws for the malformed or non-web URL %s', url => {
    expect(() => getOriginFromUrl(url)).toThrowError();
  });
});
