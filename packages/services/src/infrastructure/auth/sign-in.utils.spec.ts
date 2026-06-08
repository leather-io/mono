import {
  buildSignInMessage,
  decodeAuthIdentity,
  getJwtExpiry,
  isJwtExpired,
} from './sign-in.utils';

const accessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJidGM6bWFpbm5ldDowMjE2Y2NiNDhmMjhiZTRhNTMxYWI3ZjdkZDBmMWEwYmM4MWU4MzBhOTE5MTQ1OTUyM2JiZjA4YTU2OGIxNmQ1ZWIiLCJpZGVudGl0eSI6eyJuZXR3b3JrIjoiYnRjOm1haW5uZXQiLCJwdWJsaWNLZXkiOiIwMjE2Y2NiNDhmMjhiZTRhNTMxYWI3ZjdkZDBmMWEwYmM4MWU4MzBhOTE5MTQ1OTUyM2JiZjA4YTU2OGIxNmQ1ZWIiLCJhZGRyZXNzIjoiYmMxcTVhcHRqeTVsOXE0cWN5a3ZjY3B3bHFjdnp5ZGc3NDRxa3Y5NGQzIn0sImlzcyI6ImxlYXRoZXItYXBpIiwiYXVkIjoibGVhdGhlci1hcHAiLCJpYXQiOjE3ODA2NTE4ODcsImV4cCI6MTc4MDY1NTQ4N30.ivumnoLvBKa58jJzIZq9tDYNaaP-4tUQgpwt-hZS71g';
const refreshToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJidGM6bWFpbm5ldDowMjE2Y2NiNDhmMjhiZTRhNTMxYWI3ZjdkZDBmMWEwYmM4MWU4MzBhOTE5MTQ1OTUyM2JiZjA4YTU2OGIxNmQ1ZWIiLCJpZGVudGl0eSI6eyJuZXR3b3JrIjoiYnRjOm1haW5uZXQiLCJwdWJsaWNLZXkiOiIwMjE2Y2NiNDhmMjhiZTRhNTMxYWI3ZjdkZDBmMWEwYmM4MWU4MzBhOTE5MTQ1OTUyM2JiZjA4YTU2OGIxNmQ1ZWIiLCJhZGRyZXNzIjoiYmMxcTVhcHRqeTVsOXE0cWN5a3ZjY3B3bHFjdnp5ZGc3NDRxa3Y5NGQzIn0sImlzcyI6ImxlYXRoZXItYXBpLXJlZnJlc2giLCJpYXQiOjE3ODA2NTE4ODcsImV4cCI6MTc4MTI1NjY4N30.QTyvhXq2XYDzhFPk94nuMrWBxBPaMPwnmCjg7NiXXsg';

const expectedIdentity = {
  network: 'btc:mainnet',
  publicKey: '0216ccb48f28be4a531ab7f7dd0f1a0bc81e830a9191459523bbf08a568b16d5eb',
  address: 'bc1q5aptjy5l9q4qcykvccpwlqcvzydg744qkv94d3',
};

function encodeJwt(payload: unknown): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.signature`;
}

describe('decodeAuthIdentity', () => {
  it('extracts the identity claim from a real access token', () => {
    expect(decodeAuthIdentity(accessToken)).toEqual(expectedIdentity);
  });

  it('extracts the same identity from the matching refresh token', () => {
    expect(decodeAuthIdentity(refreshToken)).toEqual(expectedIdentity);
  });

  it('throws on a malformed token', () => {
    expect(() => decodeAuthIdentity('not-a-jwt')).toThrow();
    expect(() => decodeAuthIdentity('only.two')).toThrow();
  });

  it('throws when the identity claim is missing', () => {
    expect(() => decodeAuthIdentity(encodeJwt({ sub: 'btc:mainnet:abc' }))).toThrow();
  });

  it('throws when the identity claim is incomplete', () => {
    expect(() => decodeAuthIdentity(encodeJwt({ identity: { network: 'btc:mainnet' } }))).toThrow();
  });
});

describe('buildSignInMessage', () => {
  it('builds the timestamped sign-in message', () => {
    expect(buildSignInMessage(1780651887)).toEqual({
      message: 'Sign in to Leather\n1780651887',
      timestamp: 1780651887,
    });
  });
});

describe('getJwtExpiry', () => {
  it('reads the exp claim from a real access token', () => {
    expect(getJwtExpiry(accessToken)).toBe(1780655487);
  });

  it('returns null when exp is missing', () => {
    expect(getJwtExpiry(encodeJwt({ sub: 'btc:mainnet:abc' }))).toBeNull();
  });

  it('returns null when exp is not a number', () => {
    expect(getJwtExpiry(encodeJwt({ exp: 'soon' }))).toBeNull();
  });

  it('returns null for malformed tokens', () => {
    expect(getJwtExpiry('not-a-jwt')).toBeNull();
    expect(getJwtExpiry('only.two')).toBeNull();
    expect(getJwtExpiry('')).toBeNull();
  });
});

describe('isJwtExpired', () => {
  it('is false when exp is in the future', () => {
    expect(isJwtExpired(encodeJwt({ exp: 2000 }), 1000)).toBe(false);
  });

  it('is true when exp has passed', () => {
    expect(isJwtExpired(encodeJwt({ exp: 1000 }), 2000)).toBe(true);
  });

  it('is true at the exact expiry boundary', () => {
    expect(isJwtExpired(encodeJwt({ exp: 1000 }), 1000)).toBe(true);
  });

  it('treats unreadable tokens as expired', () => {
    expect(isJwtExpired('garbage', 1000)).toBe(true);
  });
});
