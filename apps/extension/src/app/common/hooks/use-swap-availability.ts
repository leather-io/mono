import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

export type SwapAvailability =
  | { isEnabled: true }
  | {
      isEnabled: false;
      reason: 'testnet' | 'policyAccount' | 'missingStacksAccount';
    };

export function useSwapAvailability(): SwapAvailability {
  const stacksAccount = useCurrentStacksAccount();
  const { isTestnet } = useCurrentNetworkState();
  const policy = useCurrentPolicy();

  if (isTestnet) return { isEnabled: false, reason: 'testnet' };
  if (policy) return { isEnabled: false, reason: 'policyAccount' };
  if (!stacksAccount) return { isEnabled: false, reason: 'missingStacksAccount' };
  return { isEnabled: true };
}
