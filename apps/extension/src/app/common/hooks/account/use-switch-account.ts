import { useCallback } from 'react';

import type { AccountId } from '@leather.io/models';

import {
  useCurrentStacksAccount,
  useStacksAccounts,
  useTransactionAccountIndex,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useHasSwitchedAccounts } from '@app/store/ui/ui.hooks';

import { trackSwitchAccount } from '../../analytics/track-switch-account';
import { useKeyActions } from '../use-key-actions';

export function useSwitchAccount(callback?: () => void) {
  const { switchAccount } = useKeyActions();
  const currentAccount = useCurrentStacksAccount();
  const accounts = useStacksAccounts();
  const txIndex = useTransactionAccountIndex();
  const { hasSwitched, setHasSwitched } = useHasSwitchedAccounts();

  const handleSwitchAccount = useCallback(
    (accountId: AccountId) => {
      setHasSwitched(true);
      switchAccount(accountId);
      if (callback) callback();
      if (!accounts) return;
      trackSwitchAccount(accounts[accountId.accountIndex]?.address, accountId.accountIndex);
    },
    [setHasSwitched, switchAccount, callback, accounts]
  );

  const getIsActive = useCallback(
    (index: number) =>
      typeof txIndex === 'number' && !hasSwitched
        ? index === txIndex
        : index === currentAccount?.index,
    [txIndex, hasSwitched, currentAccount]
  );

  return { handleSwitchAccount, getIsActive };
}
