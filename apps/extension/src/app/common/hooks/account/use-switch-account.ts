import { useCallback } from 'react';

import type { AccountId } from '@leather.io/models';

import {
  useCurrentStacksAccount,
  useStacksAccounts,
  useTransactionRequestAccountId,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useHasSwitchedAccounts } from '@app/store/ui/ui.hooks';

import { trackSwitchAccount } from '../../analytics/track-switch-account';
import { useKeyActions } from '../use-key-actions';

export function useSwitchAccount(callback?: () => void) {
  const { switchAccount } = useKeyActions();
  const currentAccount = useCurrentStacksAccount();
  const txAccountId = useTransactionRequestAccountId();
  const { hasSwitched, setHasSwitched } = useHasSwitchedAccounts();
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

  const getIsActive = useCallback(
    (accountId: AccountId) => {
      if (txAccountId && !hasSwitched) {
        return (
          accountId.accountIndex === txAccountId.accountIndex &&
          accountId.fingerprint === txAccountId.fingerprint
        );
      }
      return (
        accountId.accountIndex === currentAccount?.accountIndex &&
        accountId.fingerprint === currentAccount?.fingerprint
      );
    },
    [txAccountId, hasSwitched, currentAccount]
  );

  return { handleSwitchAccount, getIsActive };
}
