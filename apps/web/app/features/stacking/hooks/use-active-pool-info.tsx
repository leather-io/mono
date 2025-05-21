import { useMemo } from 'react';

import { useGetCoreInfoQuery, useGetStatusQuery } from '~/features/stacking/hooks/stacking.query';
import { usePoolInfo } from '~/features/stacking/hooks/use-pool-info';
import { useDelegationStatusQuery } from '~/features/stacking/pooled-stacking-info/use-delegation-status-query';
import { useGetPoolAddress } from '~/features/stacking/pooled-stacking-info/use-get-pool-address-query';
import { ActivePoolRewardProtocolInfo } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import {
  getPoolByAddress,
  getPoolSlugByPoolName,
} from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';

export function useActivePoolInfo() {
  const getPoolAddressQuery = useGetPoolAddress();
  const delegationStatusQuery = useDelegationStatusQuery();
  const getCoreInfoQuery = useGetCoreInfoQuery();
  const getStatusQuery = useGetStatusQuery();

  const poolAddress =
    getPoolAddressQuery.data?.address ||
    (delegationStatusQuery.data?.delegated
      ? delegationStatusQuery.data.details.delegated_to
      : undefined);

  const providerId = poolAddress ? getPoolByAddress(poolAddress)?.providerId : null;
  const activePoolSlug = providerId ? getPoolSlugByPoolName(providerId) : null;

  const delegationInfoDetails = delegationStatusQuery.data?.delegated
    ? delegationStatusQuery.data.details
    : undefined;

  const poolInfo = usePoolInfo(activePoolSlug || null);

  const isExpired =
    delegationStatusQuery.data?.delegated &&
    getCoreInfoQuery.data?.burn_block_height &&
    delegationStatusQuery.data.details.until_burn_ht !== undefined &&
    !Number.isNaN(delegationStatusQuery.data.details.until_burn_ht) &&
    delegationStatusQuery.data.details.until_burn_ht < getCoreInfoQuery.data.burn_block_height;

  const activePoolRewardProtocolInfo = useMemo<ActivePoolRewardProtocolInfo | null>(() => {
    if (!poolInfo.poolRewardProtocolInfo) {
      return null;
    }
    return {
      ...poolInfo.poolRewardProtocolInfo,
      isStacking: !!getStatusQuery.data?.stacked,
      delegatedAmountMicroStx: delegationInfoDetails?.amount_micro_stx,
      isExpired: !!isExpired,
    };
  }, [
    poolInfo.poolRewardProtocolInfo,
    delegationInfoDetails?.amount_micro_stx,
    getStatusQuery.data?.stacked,
    isExpired,
  ]);

  const isLoading =
    getPoolAddressQuery.isLoading ||
    delegationStatusQuery.isLoading ||
    getCoreInfoQuery.isLoading ||
    getStatusQuery.isLoading;

  const isError =
    getPoolAddressQuery.isError ||
    !getPoolAddressQuery.data ||
    delegationStatusQuery.isError ||
    !delegationStatusQuery.data ||
    getCoreInfoQuery.isError ||
    !getCoreInfoQuery.data ||
    getStatusQuery.isError ||
    !getStatusQuery.data;

  if (isLoading) {
    return { isLoading: true } as const;
  }

  if (isError) {
    return { isLoading: false, isError: true } as const;
  }

  return {
    ...poolInfo,
    getPoolAddressQuery,
    delegationStatusQuery,
    getCoreInfoQuery,
    activePoolRewardProtocolInfo,
  };
}
