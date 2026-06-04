function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return atob(padded);
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
