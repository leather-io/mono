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

export function useRotationStacksAccount() {
  const { fingerprint, accountIndex } = useCurrentAccountId();
  const isSoftwareWallet = useActiveWalletType() === 'software';
  const highestAccountIndex = useSelector(
    (state: RootState) => selectStacksChain(state)[fingerprint]?.highestAccountIndex
  );
  const rotationAccountIndex = isSoftwareWallet ? (highestAccountIndex ?? 0) + 1 : accountIndex + 1;
  const rotationAccountId = useMemo(
    () => ({ fingerprint, accountIndex: rotationAccountIndex }),
    [fingerprint, rotationAccountIndex]
  );
  const rotationAccount = useStacksAccount(rotationAccountId);
  if (isSoftwareWallet && !isNumber(highestAccountIndex)) return;
  return rotationAccount;
}

export function useRotationStacksAccountAddress() {
  return useRotationStacksAccount()?.address ?? '';
}
