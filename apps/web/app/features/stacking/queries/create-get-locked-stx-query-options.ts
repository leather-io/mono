import type { QueryFunctionContext } from '@tanstack/react-query';
import type { StacksApiClient } from '~/utils/stacks-api-client';

interface CreateGetLockedStxQueryOptionsArgs {
  address: string;
  apiUrl: string;
  client: Pick<StacksApiClient, 'getPrincipalStxBalance'>;
}

export function createGetLockedStxQueryOptions({
  address,
  apiUrl,
  client,
}: CreateGetLockedStxQueryOptionsArgs) {
  return {
    queryKey: ['get-locked-stx', address, apiUrl],
    async queryFn({ signal }: Pick<QueryFunctionContext, 'signal'>) {
      const balance = await client.getPrincipalStxBalance(address, signal);
      if (!balance.locked) return 0n;
      return BigInt(balance.locked.amount);
    },
    refetchOnMount: true,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  } as const;
}
