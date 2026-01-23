import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { AccountId } from '@leather.io/models';

import { RootState } from '@app/store';
import { useSignatureRequestAccountIndex } from '@app/store/signatures/requests.hooks';
import { useTransactionRequestState } from '@app/store/transactions/requests.hooks';
import { useHasSwitchedAccounts } from '@app/store/ui/ui.hooks';

import { useCurrentAccountId } from '../../account';
import { selectStacksAccountById, selectStacksAccountState } from './stacks-account.selectors';

export function useStacksAccounts() {
  return useSelector(selectStacksAccountState);
}

export function useStacksAccount(accountId: AccountId) {
  const selector = useCallback(
    (state: RootState) => selectStacksAccountById(state, accountId),
    [accountId]
  );
  return useSelector(selector);
}

// Comment below from original atom. This pattern encourages view level
// implementation details to leak into the state structure. Do not do this.
//   This contains the state of the current account:
//   could be the account associated with an in-process transaction request
//   or the last selected / first account of the user
export function useCurrentStacksAccount() {
  const currentAccount = useCurrentAccountId();
  const txIndex = useTransactionAccountIndex();
  const signatureIndex = useSignatureRequestAccountIndex();
  const { hasSwitched } = useHasSwitchedAccounts();

  const effectiveAccountIndex =
    typeof txIndex === 'number' && !hasSwitched
      ? txIndex
      : (signatureIndex ?? currentAccount.accountIndex);

  return useStacksAccount({
    fingerprint: currentAccount.fingerprint,
    accountIndex: effectiveAccountIndex,
  });
}

export function useCurrentStacksAccountAddress() {
  return useCurrentStacksAccount()?.address ?? '';
}

export function useTransactionAccountIndex() {
  const accounts = useSelector(selectStacksAccountState);
  const txPayload = useTransactionRequestState();
  const txAddress = txPayload?.stxAddress;
  return useMemo(() => {
    if (txAddress && accounts) {
      return accounts.findIndex(account => account.address === txAddress); // selected account
    }
    return undefined;
  }, [accounts, txAddress]);
}
