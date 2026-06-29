export const GITHUB_ORG = 'leather-io';
export const GITHUB_REPO = 'extension';

// Origins permitted to actually add (register) a multisig policy account via
// btc_addAccount / stx_addAccount. Any other origin can still open the approver,
// but only to let the user verify the derived address — nothing is registered.
// TODO: set the real multisig dApp origin(s) before shipping the policy methods
const policyAllowedOrigins: readonly string[] = ['https://app.leather.io'];

// Exact-match the normalized origin (scheme + host + port). Never use
// includes/startsWith/hostname-only matching — those are classic whitelist
// bypasses (e.g. `https://app.leather.io.evil.com`).
export function isWhitelistedOrigin(origin: string | null | undefined) {
  if (!origin) return false;
  try {
    return policyAllowedOrigins.includes(new URL(origin).origin);
  } catch {
    return false;
  }
}
