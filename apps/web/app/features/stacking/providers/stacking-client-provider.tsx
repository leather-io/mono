import { ReactNode, createContext, useContext, useMemo } from 'react';

import { StackingClient } from '@stacks/stacking';
import { validateStacksAddress as isValidStacksAddress } from '@stacks/transactions';
import { useQuery } from '@tanstack/react-query';
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
  const { stxAddress } = useLeatherConnect();
  const { network } = useStacksNetwork();

  const client = useMemo<StackingClient | null>(() => {
    if (stxAddress && isValidStacksAddress(stxAddress.address)) {
      return new StackingClient({ address: stxAddress.address, network });
    }

    return null;
  }, [stxAddress, network]);

  return (
    <>
      <StackingClientContext.Provider value={{ client }}>{children}</StackingClientContext.Provider>
    </>
  );
}

export function useStackingClient() {
  return useContext(StackingClientContext);
}

// FIXME: We should refactor balance queries

export function useGetAccountBalanceQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery({
    queryKey: ['getAccountBalance', client],
    queryFn: () => client.getAccountBalance(),
  });
}

export function useGetAccountBalanceLockedQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery({
    queryKey: ['getAccountBalanceLocked', client],
    queryFn: () => client.getAccountBalanceLocked(),
  });
}

export function useGetCoreInfoQuery() {
  const { client } = useStackingClient();
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery({
    queryKey: ['getCoreInfo', client],
    queryFn: () => client.getCoreInfo(),
  });
}

export function useGetAccountExtendedBalancesQuery() {
  const { client } = useStackingClient();
  return useGetAccountExtendedBalancesWithClientQuery(client);
}

export function useGetAccountExtendedBalancesWithClientQuery(client: StackingClient | null) {
  if (!client) throw new Error('Expected client to be defined.');
  return useQuery({
    queryKey: ['getAccountExtendedBalances', client],
    queryFn: () => client.getAccountExtendedBalances(),
  });
}
