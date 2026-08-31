import { SIGN_IN_MESSAGE_FIRST_LINE } from '@leather.io/constants';
import type { AuthApplication, AuthIdentity, AuthNetworkId } from '@leather.io/models';

export interface SignInMessage {
  message: string;
  timestamp: number;
}

export interface BuildSignInMessageParams {
  network: AuthNetworkId;
  domain: string;
  application: AuthApplication[];
  timestamp?: number;
}

export function buildSignInMessage({
  network,
  domain,
  application,
  timestamp = Math.floor(Date.now() / 1000),
}: BuildSignInMessageParams): SignInMessage {
  const networkMode = network.split(':')[1];
  return {
    message: [
      SIGN_IN_MESSAGE_FIRST_LINE,
      `Domain: ${domain}`,
      `Application: ${application.slice().sort().join(',')}`,
      `Network: ${networkMode}`,
      `Issued: ${timestamp}`,
    ].join('\n'),
    timestamp,
  };
}

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  return atob(base64 + '='.repeat(padding));
}

function hasAuthIdentity(value: unknown): value is { identity: AuthIdentity } {
  if (typeof value !== 'object' || value === null || !('identity' in value)) {
    return false;
  }
  const { identity } = value;
  return (
    typeof identity === 'object' &&
    identity !== null &&
    'network' in identity &&
    typeof identity.network === 'string' &&
    'publicKey' in identity &&
    typeof identity.publicKey === 'string' &&
    'address' in identity &&
    typeof identity.address === 'string'
  );
}

export function decodeAuthIdentity(accessToken: string): AuthIdentity {
  const parts = accessToken.split('.');
  const payloadSegment = parts[1];
  if (parts.length !== 3 || !payloadSegment) {
    throw new Error('Malformed JWT');
  }
  const payload: unknown = JSON.parse(base64UrlDecode(payloadSegment));
  if (!hasAuthIdentity(payload)) {
    throw new Error('JWT payload missing a valid identity claim');
  }
  return payload.identity;
}

export function getJwtExpiry(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload: unknown = JSON.parse(base64UrlDecode(parts[1]));
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'exp' in payload &&
      typeof payload.exp === 'number'
    ) {
      return payload.exp;
    }
    return null;
  } catch {
    return null;
  }
}

export function isJwtExpired(
  token: string,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): boolean {
  const expiry = getJwtExpiry(token);
  if (expiry === null) return true;
  return expiry <= nowSeconds;
}
