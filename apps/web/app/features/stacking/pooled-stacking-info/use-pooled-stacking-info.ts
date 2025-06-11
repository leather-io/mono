import { useGetPoolAddress } from '~/features/stacking/pooled-stacking-info/use-get-pool-address-query';
import { useStackingInitiatedByQuery } from '~/features/stacking/pooled-stacking-info/use-stacking-initiated-by';
import { useStxBalance } from '~/queries/balance/account-balance.hooks';

import { useGetPoxInfoQuery } from '../hooks/stacking.query';
import { useDelegationStatusQuery } from './use-delegation-status-query';

export function usePooledStackingInfo(address: string) {
  const delegationStatusQuery = useDelegationStatusQuery();

  const { filteredBalanceQuery: getAccountBalanceLockedQuery } = useStxBalance(address);

  const stackingInitiatedByQuery = useStackingInitiatedByQuery();
  const getPoxInfoQuery = useGetPoxInfoQuery();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPoolAddressQuery = useGetPoolAddress(); // Should be used later

  if (
    delegationStatusQuery.isLoading ||
    getAccountBalanceLockedQuery.isLoading ||
    stackingInitiatedByQuery.isLoading ||
    getPoxInfoQuery.isLoading
  ) {
    return { isLoading: true };
  }

  if (
    delegationStatusQuery.isError ||
    !delegationStatusQuery.data ||
    getAccountBalanceLockedQuery.isError ||
    stackingInitiatedByQuery.isError ||
    !stackingInitiatedByQuery.data ||
    getPoxInfoQuery.isError ||
    !getPoxInfoQuery.data
  ) {
    const msg = 'Error retrieving stacking or delegation info.';
    const id = 'beae38f3-59fb-4e0f-abdc-b837e2b6ebde';
    // eslint-disable-next-line no-console
    console.error(
      id,
      msg,
      delegationStatusQuery,
      getAccountBalanceLockedQuery,
      stackingInitiatedByQuery,
      getPoxInfoQuery
    );
    return { error: msg };
  }

  const stackingMinimumAmountUstx = BigInt(getPoxInfoQuery.data.min_amount_ustx);
  const hasEnoughBalanceToPool =
    getAccountBalanceLockedQuery.data?.availableBalance.amount.isGreaterThan(0);
  const hasEnoughBalanceToDirectStack =
    getAccountBalanceLockedQuery.data?.availableBalance.amount.isGreaterThan(
      stackingMinimumAmountUstx.toString()
    );

  const isStacking =
    getAccountBalanceLockedQuery.data &&
    !getAccountBalanceLockedQuery.data.lockedBalance.amount.isEqualTo(0);
  const hasExistingDelegation = delegationStatusQuery.data.delegated;
  // TODO delegated Stacking can be initiated by the user itself via self-service delegation pool
  const hasExistingDelegatedStacking =
    isStacking && address !== stackingInitiatedByQuery.data.address;
  const hasExistingDirectStacking = isStacking && address === stackingInitiatedByQuery.data.address;

  return {
    hasExistingDelegation,
    hasExistingDelegatedStacking,
    hasExistingDirectStacking,
    hasEnoughBalanceToPool,
    hasEnoughBalanceToDirectStack,
    stackingMinimumAmountUstx,
  };
}
