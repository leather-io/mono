import { useMemo } from 'react';

import { ChainLogoIcon } from '~/components/icons/chain-logo';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { STACKS_BLOCKS_PER_DAY } from '~/constants/constants';
import { ProviderId } from '~/data/data';
import { useGetPoxInfoQuery } from '~/features/stacking/hooks/stacking.query';
import {
  LiquidTokenMap,
  ProtocolSlug,
} from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import { getProtocolBySlug } from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { useDaoBalance } from '~/queries/protocols/dao/balance';
import { useStackingTrackerProtocol } from '~/queries/stacking-tracker/protocols';

export function useDaoInfo() {
  const protocolSlug: ProtocolSlug = 'stacking-dao';
  const providerId: ProviderId = 'stackingDao';

  const poxInfoQuery = useGetPoxInfoQuery();
  const balance = useDaoBalance();
  const stackingTracker = useStackingTrackerProtocol(protocolSlug);

  const protocol = getProtocolBySlug(protocolSlug);

  const isLoading = balance.isLoading || poxInfoQuery.isLoading || stackingTracker.isLoading;
  const isError =
    balance.isError ||
    !balance.data ||
    poxInfoQuery.isError ||
    !poxInfoQuery.data ||
    stackingTracker.isError ||
    !stackingTracker.data;

  const info = useMemo(() => {
    if (isLoading || isError) {
      return null;
    }

    const payout = LiquidTokenMap[protocol.liquidToken];

    return {
      nextCycleDays: poxInfoQuery.data.next_cycle.blocks_until_reward_phase / STACKS_BLOCKS_PER_DAY,
      logo: <ProviderIcon providerId={providerId} />,
      name: protocol.name,
      id: providerId,
      slug: protocolSlug,
      amount: balance.data,
      apr: stackingTracker.data.entity.apr,
      payout,
      payoutIcon: <ChainLogoIcon symbol={payout} />,
    };
  }, [isError, protocol, isLoading, balance.data, poxInfoQuery.data, stackingTracker.data]);

  if (isLoading) {
    return { isLoading: true } as const;
  }

  if (isError) {
    return { isLoading: false, isError: true } as const;
  }

  return { info, isLoading, isError, balance, poxInfoQuery, stackingTracker };
}
