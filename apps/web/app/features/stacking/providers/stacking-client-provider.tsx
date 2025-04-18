import { ReactNode, createContext, useContext, useMemo } from 'react';

import { StackingClient } from '@stacks/stacking';
import { validateStacksAddress as isValidStacksAddress } from '@stacks/transactions';
import { useLeatherConnect } from '~/store/addresses';
import { useStacksNetwork } from '~/store/stacks-network';

import { fetchFn } from './fetch-fn';

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
      return new StackingClient({
        address: stxAddress.address,
        network,
        client: { fetch: fetchFn },
      });
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

export function useStackingClientRequired() {
  const { client, ...hook } = useStackingClient();

  if (!client) {
    throw new Error('Expected to have a StackingClient available in the context.');
  }

  return {
    ...hook,
    client,
  };
}
