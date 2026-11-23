import { csp } from './csp';

const colorSchemeClientHint = 'Sec-CH-Prefers-Color-Scheme';

const securityHeaders = {
  'Content-Security-Policy': csp,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Accept-CH': colorSchemeClientHint,
  Vary: colorSchemeClientHint,
  'Critical-CH': colorSchemeClientHint,
};

export function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
