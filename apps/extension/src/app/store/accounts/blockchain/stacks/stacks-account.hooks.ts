import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { AccountId } from '@leather.io/models';
import { isNumber } from '@leather.io/utils';

import { selectStacksChain } from '@app/store/chains/stx-chain.selectors';
import { useActiveWalletType } from '@app/store/common/wallet-type.selectors';
import { useInMemoryKeys } from '@app/store/in-memory-key/use-in-memory-keys';
import { type RootState } from '@app/store/store';

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

export function useFreshStacksAccount() {
  const { fingerprint, accountIndex } = useCurrentAccountId();
  const isSoftwareWallet = useActiveWalletType() === 'software';
  const highestAccountIndex = useSelector(
    (state: RootState) => selectStacksChain(state)[fingerprint]?.highestAccountIndex
  );
  const freshAccountIndex = isSoftwareWallet ? (highestAccountIndex ?? 0) + 1 : accountIndex + 1;
  const freshAccountId = useMemo(
    () => ({ fingerprint, accountIndex: freshAccountIndex }),
    [fingerprint, freshAccountIndex]
  );
  const freshAccount = useStacksAccount(freshAccountId);
  if (isSoftwareWallet && !isNumber(highestAccountIndex)) return;
  return freshAccount;
}

export function useFreshStacksAccountAddress() {
  return useFreshStacksAccount()?.address ?? '';
}
