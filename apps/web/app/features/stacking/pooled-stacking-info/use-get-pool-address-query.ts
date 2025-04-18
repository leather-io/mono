import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useGetAccountExtendedBalancesQuery } from '~/features/stacking/hooks/stacking.query';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useLeatherConnect } from '~/store/addresses';

import { StacksClient } from '@leather.io/query';

import { useDelegationStatusQuery } from './use-delegation-status-query';

/**
 * Fetches the address of the delegator the currently active account has delegated to or is stacking with if any.
 */
export function useGetPoolAddress() {
  // The pool address is fetched from two locations as there is no one place where this information
  // is always available.
  //
  // - When the user is delegating, the pool's address can be fetched from the delegation state map.
  // - When the pool is stacking the user's funds, the pool's address can be fetched from the
  //   transaction data that initiated stacking.
  //
  // This means that after a user has delegated to a pool, but before the pool has started stacking,
  // the pool's address can only be fetched from the delegation state map. If the user is both
  // delegating and stacking, the pool address will be available in both locations. However, if the
  // user is still stacking and they have revoked the delegation, the pool address can only be
  // obtained from the stacking transaction data.
  //
  // Regardless of which at which point in the pooling lifecycle the user is in, this data should
  // always be available from at least one source.

  const { stacksAccount } = useLeatherConnect();
  if (!stacksAccount?.address) throw new Error('No stacksAccount available');

  const stacksClient = useStacksClient();

  const balancesQuery = useGetAccountExtendedBalancesQuery();
  const delegationStatusQuery = useDelegationStatusQuery();

  const txId = balancesQuery.data?.stx?.lock_tx_id;

  const poolAddress = delegationStatusQuery.data?.delegated
    ? delegationStatusQuery.data?.details.delegated_to
    : undefined;

  return useQuery(
    createGetPoolAddressQueryOptions({
      stacksClient,
      poolAddress,
      txId,
      ready: !balancesQuery.isLoading && !delegationStatusQuery.isLoading,
    })
  );
}

interface GetPoolAddressQueryOptionsArgs {
  txId: string | undefined;
  poolAddress: string | undefined;
  stacksClient: StacksClient;
  ready: boolean;
}

export function createGetPoolAddressQueryOptions({
  txId,
  poolAddress,
  stacksClient,
  ready,
}: GetPoolAddressQueryOptionsArgs) {
  return {
    queryKey: ['stacker', txId, poolAddress] as const,
    queryFn: async () => {
      if (poolAddress) {
        return { poolAddress };
      }
      if (!txId) {
        return { address: null };
      }
      // https://github.com/hirosystems/stacks-blockchain-api/tree/master/client#known-issues
      const res = await stacksClient.getTransactionById(txId, new AbortController().signal);
      return { address: res.sender_address };
    },
    enabled: ready,
  } satisfies UseQueryOptions;
}
