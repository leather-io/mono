import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import type { AccountId } from '@leather.io/models';

import { RootState } from '@app/store';
import { useInMemoryKeys } from '@app/store/in-memory-key/use-in-memory-keys';

import { useCurrentAccountId } from '../../account';
import { selectStacksAccountById, selectStacksAccountState } from './stacks-account.selectors';

export function useStacksAccounts() {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectStacksAccountState(state, version));
}

export function useStacksAccount(accountId: AccountId) {
  const { version } = useInMemoryKeys();
  const selector = useCallback(
    (state: RootState) => selectStacksAccountById(state, version, accountId),
    [accountId, version]
  );
  return useSelector(selector);
}

export function useCurrentStacksAccount() {
  const currentAccount = useCurrentAccountId();
  return useStacksAccount(currentAccount);
}

export function useCurrentStacksAccountAddress() {
  return useCurrentStacksAccount()?.address ?? '';
}
