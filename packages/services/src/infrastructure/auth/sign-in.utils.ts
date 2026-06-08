import type { AuthIdentity } from '@leather.io/models';

export interface SignInMessage {
  message: string;
  timestamp: number;
}

export function buildSignInMessage(
  timestamp: number = Math.floor(Date.now() / 1000)
): SignInMessage {
  return {
    message: `Sign in to Leather\n${timestamp}`,
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
