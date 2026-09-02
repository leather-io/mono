import { IS_DEV_ENV, WALLET_ENVIRONMENT } from './environment';

export const GITHUB_ORG = 'leather-io';
export const GITHUB_REPO = 'extension';

// Origins permitted to actually add (register) a multisig policy account via
// btc_addAccount / stx_addAccount. Any other origin can still open the approver,
// but only to let the user verify the derived address — nothing is registered.
const stagingOrigins: readonly string[] =
  WALLET_ENVIRONMENT === 'production' ? [] : ['https://dev-leather-web.wallet-6d1.workers.dev'];

const POLICY_ALLOWED_ORIGINS: readonly string[] = ['https://app.leather.io', ...stagingOrigins];

const LOOPBACK_HOSTNAMES: readonly string[] = ['localhost', '127.0.0.1', '[::1]'];

// Exact-match the normalized origin (scheme + host + port). Never use
// includes/startsWith/hostname-only matching — those are classic whitelist
// bypasses (e.g. `https://app.leather.io.evil.com`).
export function isWhitelistedOrigin(origin: string | null | undefined) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (IS_DEV_ENV && LOOPBACK_HOSTNAMES.includes(url.hostname)) return true;
    return POLICY_ALLOWED_ORIGINS.includes(url.origin);
  } catch {
    return false;
  }
}
