import { ReactNode } from 'react';

import { useStacksAccount } from '~/store/addresses';

interface StacksAccountLoaderProps {
  children(stacksAccount: any): ReactNode;
}

export function StacksAccountLoader({ children }: StacksAccountLoaderProps) {
  const stacksAccount = useStacksAccount();

  if (!stacksAccount) {
    return null;
  }

  return children(stacksAccount);
}
