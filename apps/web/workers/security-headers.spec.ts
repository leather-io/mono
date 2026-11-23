import { describe, expect, test } from 'vitest';

import { csp } from './csp';
import { withSecurityHeaders } from './security-headers';

const expectedSecurityHeaders = {
  'Content-Security-Policy': csp,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Accept-CH': 'Sec-CH-Prefers-Color-Scheme',
  Vary: 'Sec-CH-Prefers-Color-Scheme',
  'Critical-CH': 'Sec-CH-Prefers-Color-Scheme',
};

function getSecurityHeaders(response: Response) {
  return Object.fromEntries(
    Object.keys(expectedSecurityHeaders).map(name => [name, response.headers.get(name)])
  );
}

describe('withSecurityHeaders', () => {
  test('keeps a redirect status and location and adds the security headers', () => {
    const location = 'https://leather.io/staking?foo=bar';
    const response = withSecurityHeaders(Response.redirect(location, 301));
    expect(response.status).toBe(301);
    expect(response.headers.get('Location')).toBe(location);
    expect(getSecurityHeaders(response)).toEqual(expectedSecurityHeaders);
  });

  test('keeps a response status, body and own headers and adds the security headers', async () => {
    const response = withSecurityHeaders(
      new Response('<html></html>', {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' },
      })
    );
    expect(response.status).toBe(404);
    expect(response.statusText).toBe('Not Found');
    expect(await response.text()).toBe('<html></html>');
    expect(response.headers.get('Content-Type')).toBe('text/html');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(getSecurityHeaders(response)).toEqual(expectedSecurityHeaders);
  });

  test('overrides a header the response already sets', () => {
    const response = withSecurityHeaders(
      new Response(null, { headers: { 'Referrer-Policy': 'unsafe-url', Vary: 'Accept' } })
    );
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('Vary')).toBe('Sec-CH-Prefers-Color-Scheme');
  });
});
