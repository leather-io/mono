import { useMemo } from 'react';

import { ProviderIcon } from '~/components/icons/provider-icon';
import { STACKS_BLOCKS_PER_DAY } from '~/constants/constants';
import { useGetPoxInfoQuery, useGetStatusQuery } from '~/features/stacking/hooks/stacking.query';
import { useGetPoolAddress } from '~/features/stacking/pooled-stacking-info/use-get-pool-address-query';
import { PoolRewardProtocolInfo } from '~/features/stacking/start-pooled-stacking/components/preset-pools';
import {
  PoolSlug,
  getPoolFromSlug,
} from '~/features/stacking/start-pooled-stacking/utils/stacking-pool-types';
import { useStxMarketDataQuery } from '~/queries/market-data/stx-market-data.query';
import { useStackingTrackerPool } from '~/queries/stacking-tracker/pools';
import { useStacksNetwork } from '~/store/stacks-network';
import { formatPoxAddressToNetwork } from '~/utils/stacking-pox';
import { toHumanReadablePercent, toHumanReadableStx } from '~/utils/unit-convert';

import {
  baseCurrencyAmountInQuote,
  createMoneyFromDecimal,
  i18nFormatCurrency,
} from '@leather.io/utils';

export function usePoolInfo(poolSlug: PoolSlug) {
  const poxInfoQuery = useGetPoxInfoQuery();
  const getStatusQuery = useGetStatusQuery();
  const getPoolAddressQuery = useGetPoolAddress();
  const stacksNetwork = useStacksNetwork();
  const stackingTrackerPool = useStackingTrackerPool(poolSlug);
  const { data: stxMarketData, isLoading: isStxMarketDataLoading } = useStxMarketDataQuery();

  const isLoading =
    poxInfoQuery.isLoading ||
    getStatusQuery.isLoading ||
    getPoolAddressQuery.isLoading ||
    stackingTrackerPool.isLoading ||
    isStxMarketDataLoading;

  const isError =
    poxInfoQuery.isError ||
    !poxInfoQuery.data ||
    getStatusQuery.isError ||
    !getStatusQuery.data ||
    getPoolAddressQuery.isError ||
    !getPoolAddressQuery.data ||
    stackingTrackerPool.isError ||
    !stackingTrackerPool.data ||
    !stxMarketData;

  const pool = useMemo(() => getPoolFromSlug(poolSlug), [poolSlug]);

  const poolRewardProtocolInfo = useMemo(() => {
    if (isLoading || isError) {
      return null;
    }

    const poxAddress = getStatusQuery.data?.stacked
      ? getStatusQuery.data.details.pox_address
      : null;

    const tvl = stackingTrackerPool.data.lastCycle?.pool?.stacked_amount
      ? toHumanReadableStx(stackingTrackerPool.data.lastCycle?.pool?.stacked_amount, 0)
      : '100,000,000 STX';

    const tvlBaseCurrencyAmount = baseCurrencyAmountInQuote(
      createMoneyFromDecimal(stackingTrackerPool.data.lastCycle?.pool?.stacked_amount ?? 0, 'STX'),
      stxMarketData
    );

    const tvlUsd = i18nFormatCurrency(tvlBaseCurrencyAmount);

    const title = stackingTrackerPool.data.entity.name || pool.name;
    const url = stackingTrackerPool.data.entity.website || pool.url;
    const apr = stackingTrackerPool.data.entity.apr
      ? toHumanReadablePercent(stackingTrackerPool.data.entity.apr)
      : pool.estApr;

    const rewardAddress =
      stackingTrackerPool.data.lastCycle?.pool.pox_address ||
      (poxAddress && formatPoxAddressToNetwork(stacksNetwork.network, poxAddress));

    return {
      id: poolSlug,

      logo: <ProviderIcon providerId={pool.providerId} />,
      rewardsToken: pool.payout,
      description: pool.description,
      minCommitment: pool.minAmount,
      minCommitmentUsd: pool.minCommitmentUsd,

      title,
      url,
      apr,
      tvl,
      tvlUsd,
      status: getStatusQuery.data?.stacked ? 'Active' : 'Waiting on pool',
      poolAddress: getPoolAddressQuery.data?.poolAddress || '',
      rewardAddress,
      minLockupPeriodDays: poxInfoQuery.data.reward_cycle_length / STACKS_BLOCKS_PER_DAY,
      nextCycleDays: poxInfoQuery.data.next_cycle.blocks_until_reward_phase / STACKS_BLOCKS_PER_DAY,
      nextCycleNumber: poxInfoQuery.data.next_cycle.id,
      nextCycleBlocks: poxInfoQuery.data.next_cycle.blocks_until_reward_phase,
    } as PoolRewardProtocolInfo;
  }, [
    pool,
    isError,
    poolSlug,
    isLoading,
    poxInfoQuery.data,
    getStatusQuery.data,
    stacksNetwork.network,
    stackingTrackerPool.data,
    getPoolAddressQuery.data,
    stxMarketData,
  ]);

  const hardcodePoolRewardProtocolInfo = useMemo(
    () =>
      ({
        apr: pool.estApr,
        description: pool.description,
        id: pool.providerId,
        logo: <ProviderIcon providerId={pool.providerId} />,
        minCommitment: pool.minAmount,
        minCommitmentUsd: pool.minCommitmentUsd,
        minLockupPeriodDays: 1,
        nextCycleBlocks: 220,
        nextCycleDays: 15,
        nextCycleNumber: 110,
        poolAddress: pool.poolAddress['mainnet'],
        rewardAddress: pool.poolAddress['mainnet'],
        rewardsToken: pool.payout,
        status: 'Active',
        title: pool.name,
        tvl: '50,000,000 STX',
        tvlUsd: pool.tvlUsd,
      }) as PoolRewardProtocolInfo,
    [pool]
  );

  if (isLoading) {
    return { isLoading: true, hardcodePoolRewardProtocolInfo } as const;
  }

  if (isError) {
    return { isLoading: false, isError: true, hardcodePoolRewardProtocolInfo } as const;
  }

  return {
    poxInfoQuery,
    getStatusQuery,
    getPoolAddressQuery,
    stacksNetwork,
    hardcodePoolRewardProtocolInfo,
    stackingTrackerPool,
    poolRewardProtocolInfo,
    isLoading: false,
    isError: false,
  };
}
