// Whether the wallet's active account may register the requested policy account:
// - `match`: the active account's key is part of the descriptor / public keys
// - `mismatch`: there is an active account, but it is not a signer on the policy
// - `no-active-account`: there is no active account of the relevant chain
export type PolicyMatchStatus = 'match' | 'mismatch' | 'no-active-account';

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
