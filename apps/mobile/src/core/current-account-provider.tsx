import { createContext, useContext, useEffect, useState } from 'react';

import { Account } from '@/store/accounts/accounts';
import { useAccounts } from '@/store/accounts/accounts.read';

import { HasChildren } from '@leather.io/ui/native';

interface CurrentAccountContextValue {
  currentAccount: Account | null;
  setCurrentAccount(account: Account | null): void;
}

const CurrentAccountContext = createContext<CurrentAccountContextValue | null>(null);

export function useCurrentAccount() {
  const context = useContext(CurrentAccountContext);
  if (!context) throw new Error('`useCurrentAccount` must be used within `CurrentAccountProvider`');
  return context;
}

export function CurrentAccountProvider({ children }: HasChildren) {
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const { list: activeAccounts } = useAccounts('active');
  const { list: hiddenAccounts } = useAccounts('hidden');
  useEffect(() => {
    if (currentAccount) return;
    if (activeAccounts[0]) {
      setCurrentAccount(activeAccounts[0]);
      return;
    }
    if (hiddenAccounts[0]) {
      setCurrentAccount(hiddenAccounts[0]);
      return;
    }
  }, [currentAccount, activeAccounts, hiddenAccounts]);

  return (
    <CurrentAccountContext.Provider
      value={{
        currentAccount,
        setCurrentAccount,
      }}
    >
      {children}
    </CurrentAccountContext.Provider>
  );
}

interface CurrentAccountLoaderProps {
  children(data: Account): React.ReactNode;
  fallback: React.ReactNode;
}
export function CurrentAccountLoader({ fallback, children }: CurrentAccountLoaderProps) {
  const { currentAccount } = useCurrentAccount();
  if (currentAccount) return children(currentAccount);
  return fallback;
}
