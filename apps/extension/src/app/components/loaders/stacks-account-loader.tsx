import { ReactNode } from 'react';

import type { DistributedOmit } from 'type-fest';

import type { AccountId } from '@leather.io/models';

import { useCurrentAccountId } from '@app/store/accounts/account';
import {
  useCurrentStacksAccount,
  useStacksAccount,
} from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';

interface CurrentStacksAccountLoaderProps {
  children(data: StacksAccount): ReactNode;
  fallback?: ReactNode;
}
export function CurrentStacksAccountLoader({
  children,
  fallback,
}: CurrentStacksAccountLoaderProps) {
  const currentAccount = useCurrentStacksAccount();
  if (!currentAccount) return fallback;
  return children(currentAccount);
}

interface StacksAccountBaseLoaderProps {
  children(data: StacksAccount): React.ReactNode;
}

interface StacksAccountCurrentLoaderProps extends StacksAccountBaseLoaderProps {
  current: true;
}

interface StacksAccountIndexLoaderProps extends StacksAccountBaseLoaderProps {
  accountId: AccountId;
}

type StacksAccountLoaderProps = StacksAccountCurrentLoaderProps | StacksAccountIndexLoaderProps;

export function useStacksAccountLoader(
  props: DistributedOmit<StacksAccountLoaderProps, 'children'>
) {
  const currentAccount = useCurrentAccountId();
  const properAccountId = 'current' in props ? currentAccount : props.accountId;

  const account = useStacksAccount(properAccountId);

  if (!account) return null;
  return account;
}
