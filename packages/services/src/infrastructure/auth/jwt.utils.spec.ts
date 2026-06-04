import { describe, expect, it } from 'vitest';

import { getJwtExpiry, isJwtExpired } from './jwt.utils';

function encodeSegment(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeJwt(payload: object): string {
  return `${encodeSegment({ alg: 'HS256', typ: 'JWT' })}.${encodeSegment(payload)}.fake-signature`;
}

describe(getJwtExpiry.name, () => {
  it('reads the exp claim from a well-formed token', () => {
    expect(getJwtExpiry(makeJwt({ exp: 1780000000 }))).toBe(1780000000);
  });

  it('returns null when exp is missing', () => {
    expect(getJwtExpiry(makeJwt({ sub: 'user' }))).toBeNull();
  });

  it('returns null when exp is not a number', () => {
    expect(getJwtExpiry(makeJwt({ exp: 'soon' }))).toBeNull();
  });

  it('returns null for malformed tokens', () => {
    expect(getJwtExpiry('not-a-jwt')).toBeNull();
    expect(getJwtExpiry('a.%%%.c')).toBeNull();
    expect(getJwtExpiry('')).toBeNull();
  });
});

describe(isJwtExpired.name, () => {
  it('is false when exp is in the future', () => {
    expect(isJwtExpired(makeJwt({ exp: 2000 }), 1000)).toBe(false);
  });

  it('is true when exp has passed', () => {
    expect(isJwtExpired(makeJwt({ exp: 1000 }), 2000)).toBe(true);
  });

  it('is true at the exact expiry boundary', () => {
    expect(isJwtExpired(makeJwt({ exp: 1000 }), 1000)).toBe(true);
  });

  it('treats unreadable tokens as expired', () => {
    expect(isJwtExpired('garbage', 1000)).toBe(true);
  });
});
