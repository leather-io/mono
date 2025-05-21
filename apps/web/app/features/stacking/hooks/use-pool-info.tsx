import { useMemo } from 'react';

import { ChainLogoIcon } from '~/components/icons/chain-logo';
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
import { parseNumber, toHumanReadablePercent, toHumanReadableStx } from '~/utils/unit-convert';

import {
  baseCurrencyAmountInQuote,
  createMoneyFromDecimal,
  i18nFormatCurrency,
} from '@leather.io/utils';

export function usePoolInfo(poolSlug: PoolSlug | null) {
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
    !stxMarketData;

  const pool = useMemo(() => poolSlug && getPoolFromSlug(poolSlug), [poolSlug]);

  const poolRewardProtocolInfo = useMemo(() => {
    if (isLoading || isError || !pool || !poolSlug) {
      return null;
    }

    const poxAddress = getStatusQuery.data?.stacked
      ? getStatusQuery.data.details.pox_address
      : null;

    const tvl =
      stackingTrackerPool.data?.lastCycle?.pool?.stacked_amount !== undefined
        ? toHumanReadableStx(stackingTrackerPool.data.lastCycle?.pool?.stacked_amount, 0)
        : null;

    const tvlBaseCurrencyAmount =
      stackingTrackerPool.data &&
      baseCurrencyAmountInQuote(
        createMoneyFromDecimal(
          stackingTrackerPool.data.lastCycle?.pool?.stacked_amount ?? 0,
          'STX'
        ),
        stxMarketData
      );
    const tvlUsd = tvlBaseCurrencyAmount && i18nFormatCurrency(tvlBaseCurrencyAmount);

    const title = stackingTrackerPool.data?.entity.name || pool.name;
    const url = stackingTrackerPool.data?.entity.website || pool.url;
    const apr = stackingTrackerPool.data?.entity.apr
      ? toHumanReadablePercent(stackingTrackerPool.data.entity.apr)
      : null;

    const rewardAddress =
      stackingTrackerPool.data?.lastCycle?.pool.pox_address ||
      (poxAddress && formatPoxAddressToNetwork(stacksNetwork.network, poxAddress));

    const minCommitmentMicroSTX = pool.minimumDelegationAmount;
    const minCommitment = parseNumber(minCommitmentMicroSTX).dividedBy(1e6).toNumber();
    const minCommitmentBaseCurrencyAmount = baseCurrencyAmountInQuote(
      createMoneyFromDecimal(minCommitment ?? 0, 'STX'),
      stxMarketData
    );
    const minCommitmentUsd = i18nFormatCurrency(minCommitmentBaseCurrencyAmount);

    const result: PoolRewardProtocolInfo = {
      id: poolSlug,

      logo: <ProviderIcon providerId={pool.providerId} />,
      rewardsToken: pool.payout,
      description: pool.description,
      minCommitment,
      minCommitmentUsd,

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
      rewardTokenIcon: <ChainLogoIcon symbol={pool.payout} />,
    };

    return result;
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

  if (isLoading) {
    return { isLoading: true } as const;
  }

  if (isError) {
    return { isLoading: false, isError: true } as const;
  }

  return {
    poxInfoQuery,
    getStatusQuery,
    getPoolAddressQuery,
    stacksNetwork,
    stackingTrackerPool,
    poolRewardProtocolInfo,
    isLoading: false,
    isError: false,
  };
}
