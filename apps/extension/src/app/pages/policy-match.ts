import { isWhitelistedOrigin } from '@shared/constants';

// Whether the wallet's active account may register the requested policy:
// - `match`: the active account's key is part of the descriptor / public keys
// - `mismatch`: there is an active account, but it is not a signer on the policy
// - `no-active-account`: there is no active account of the relevant chain
export type PolicyMatchStatus = 'match' | 'mismatch' | 'no-active-account';

// Whether the requesting origin may add the account to the extension (`add`,
// whitelisted origins only) or only have the user verify the derived address
// without registering anything (`verify`, every other origin).
export type PolicyApprovalMode = 'add' | 'verify';

export function getPolicyApprovalMode(
  origin: string | null | undefined,
  topOrigin: string | null | undefined
): PolicyApprovalMode {
  return isWhitelistedOrigin(origin) && isWhitelistedOrigin(topOrigin) ? 'add' : 'verify';
}

// Shown in verify mode so the user understands the requesting site cannot add an
// account — they are only double-checking the address it supplied.
export const verifyModeCalloutMessage =
  "This site can't add accounts. You're only verifying the address.";

interface PolicyCallout {
  variant: 'info' | 'warning';
  message: string;
}

const connectedAccountRequirement =
  'You need to use an account that is connected to this multisig account.';

// The callout shown above the Confirm action. It always states the connected
// account requirement, surfaced as `info` when the active account satisfies it
// and `warning` (with the reason) when it does not.
export function policyCallout(status: PolicyMatchStatus, chainLabel: string): PolicyCallout {
  if (status === 'no-active-account')
    return {
      variant: 'warning',
      message: `No active ${chainLabel} account. ${connectedAccountRequirement}`,
    };
  if (status === 'mismatch')
    return {
      variant: 'warning',
      message: `Your active ${chainLabel} account isn't connected to this multisig account. ${connectedAccountRequirement}`,
    };
  return { variant: 'info', message: connectedAccountRequirement };
}
