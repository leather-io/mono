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

export type BtcAddAccountKind = 'policy' | 'timelocked';

export function getPolicyApprovalMode(
  origin: string | null | undefined,
  topOrigin: string | null | undefined
): PolicyApprovalMode {
  return isWhitelistedOrigin(origin) && isWhitelistedOrigin(topOrigin) ? 'add' : 'verify';
}

export function getBtcAddAccountApprovalMode(
  origin: string | null | undefined,
  topOrigin: string | null | undefined,
  kind: BtcAddAccountKind
): PolicyApprovalMode {
  return kind === 'timelocked' ? 'verify' : getPolicyApprovalMode(origin, topOrigin);
}

// Shown in verify mode so the user understands the requesting site cannot add an
// account — they are only double-checking the address it supplied.
export const verifyModeCalloutMessage =
  "This site can't add accounts. You're only verifying the address.";

export const timelockedVerifyCalloutMessage =
  "Timelocked addresses can't be added to your wallet. You're only verifying the address.";

interface PolicyCallout {
  variant: 'info' | 'warning';
  message: string;
}

const defaultPolicySubject = 'this multisig account';

function connectedAccountRequirement(subject: string) {
  return `You need to use an account that is connected to ${subject}.`;
}

// The callout shown above the Confirm action. It always states the connected
// account requirement, surfaced as `info` when the active account satisfies it
// and `warning` (with the reason) when it does not.
export function policyCallout(
  status: PolicyMatchStatus,
  chainLabel: string,
  subject = defaultPolicySubject
): PolicyCallout {
  const requirement = connectedAccountRequirement(subject);
  if (status === 'no-active-account')
    return {
      variant: 'warning',
      message: `No active ${chainLabel} account. ${requirement}`,
    };
  if (status === 'mismatch')
    return {
      variant: 'warning',
      message: `Your active ${chainLabel} account isn't connected to ${subject}. ${requirement}`,
    };
  return { variant: 'info', message: requirement };
}
