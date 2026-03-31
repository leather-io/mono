import { useCallback } from 'react';

import type { AccountId } from '@leather.io/models';

import { store } from '@app/store';
import {
  useCurrentStacksAccount,
  useTransactionAccountIndex,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { selectStacksAccountById } from '@app/store/accounts/blockchain/stacks/stacks-account.selectors';
import { useHasSwitchedAccounts } from '@app/store/ui/ui.hooks';

import { trackSwitchAccount } from '../../analytics/track-switch-account';
import { useKeyActions } from '../use-key-actions';

export function useSwitchAccount(callback?: () => void) {
  const { switchAccount } = useKeyActions();
  const currentAccount = useCurrentStacksAccount();
  const txIndex = useTransactionAccountIndex();
  const { hasSwitched, setHasSwitched } = useHasSwitchedAccounts();

  const handleSwitchAccount = useCallback(
    (accountId: AccountId) => {
      setHasSwitched(true);
      switchAccount(accountId);
      if (callback) callback();
      const account = selectStacksAccountById(store.getState(), accountId);
      if (account) {
        trackSwitchAccount(account.address, accountId.accountIndex);
      }
    },
    [setHasSwitched, switchAccount, callback]
  );

  const getIsActive = useCallback(
    (accountId: AccountId) => {
      if (typeof txIndex === 'number' && !hasSwitched) {
        return (
          accountId.accountIndex === txIndex &&
          accountId.fingerprint === currentAccount?.fingerprint
        );
      }
      return (
        accountId.accountIndex === currentAccount?.accountIndex &&
        accountId.fingerprint === currentAccount?.fingerprint
      );
    },
    [txIndex, hasSwitched, currentAccount]
  );

  return { handleSwitchAccount, getIsActive };
}
