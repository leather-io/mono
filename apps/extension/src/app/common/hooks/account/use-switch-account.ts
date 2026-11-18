import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { AccountId } from '@leather.io/models';

import {
  useCurrentStacksAccount,
  useStacksAccounts,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { selectActivePolicyId } from '@app/store/active/active.selectors';
import { type PolicyStore, parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { useHasSwitchedAccounts } from '@app/store/ui/ui.hooks';

import { trackSwitchAccount } from '../../analytics/track-switch-account';
import { useKeyActions } from '../use-key-actions';

export function useSwitchAccount(callback?: () => void) {
  const { switchAccount, switchAccountToPolicy } = useKeyActions();
  const currentAccount = useCurrentStacksAccount();
  const activePolicyId = useSelector(selectActivePolicyId);
  const { setHasSwitched } = useHasSwitchedAccounts();
  const stacksAccounts = useStacksAccounts();

  const handleSwitchAccount = useCallback(
    (accountId: AccountId) => {
      setHasSwitched(true);
      switchAccount(accountId);
      if (callback) callback();
      const account = stacksAccounts.find(
        a => a.fingerprint === accountId.fingerprint && a.index === accountId.accountIndex
      );
      if (account) {
        trackSwitchAccount(account.address, accountId.accountIndex);
      }
    },
    [setHasSwitched, switchAccount, callback, stacksAccounts]
  );

  const handleSwitchToPolicy = useCallback(
    (policy: PolicyStore) => {
      setHasSwitched(true);
      switchAccountToPolicy(policy.id);
      if (callback) callback();
      trackSwitchAccount(policy.address, parsePolicyParent(policy.parentAccountId).accountIndex);
    },
    [setHasSwitched, switchAccountToPolicy, callback]
  );

  const getIsActive = useCallback(
    (accountId: AccountId) => {
      if (activePolicyId) return false;
      return (
        accountId.accountIndex === currentAccount?.accountIndex &&
        accountId.fingerprint === currentAccount?.fingerprint
      );
    },
    [activePolicyId, currentAccount]
  );

  const getIsPolicyActive = useCallback(
    (policyId: string) => activePolicyId === policyId,
    [activePolicyId]
  );

  return { handleSwitchAccount, handleSwitchToPolicy, getIsActive, getIsPolicyActive };
}
