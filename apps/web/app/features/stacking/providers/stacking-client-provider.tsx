import { ReactNode, createContext, useContext, useMemo } from 'react';

import { StackingClient } from '@stacks/stacking';
import { validateStacksAddress as isValidStacksAddress } from '@stacks/transactions';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

interface StackingClientContext {
  client: null | StackingClient;
}
const StackingClientContext = createContext<StackingClientContext>({
  client: null,
});

interface Props {
  children: ReactNode;
}

export function StackingClientProvider({ children }: Props) {
  const { stacksAccount: stxAddress } = useLeatherConnect();
  const { network } = useStacksNetwork();

  const client = useMemo<StackingClient | null>(() => {
    if (stxAddress && isValidStacksAddress(stxAddress.address)) {
      return new StackingClient({ address: stxAddress.address, network });
    }

    return null;
  }, [stxAddress, network]);

  return (
    <StackingClientContext.Provider value={{ client }}>{children}</StackingClientContext.Provider>
  );
}

export function useStackingClient() {
  return useContext(StackingClientContext);
}
