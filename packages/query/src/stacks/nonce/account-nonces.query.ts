import { StacksQueryPrefixes } from '../../query-prefixes';
import { type StacksClient } from '../stacks-client';

const queryOptions = {
  refetchOnMount: 'always',
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
} as const;

interface CreateGetAccountNoncesQueryOptionsArgs {
  address: string;
  client: StacksClient;
  network: string;
}
export function createGetAccountNoncesQueryOptions({
  address,
  client,
  network,
}: CreateGetAccountNoncesQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [StacksQueryPrefixes.GetAccountNonces, address, network],
    queryFn: () => client.getAccountNonces(address),
    ...queryOptions,
  } as const;
}
