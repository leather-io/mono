import { ReactNode, useMemo } from 'react';

import BigNumber from 'bignumber.js';
import { ChainLogoIcon } from '~/components/icons/chain-logo';
import { ProviderIcon } from '~/components/icons/provider-icon';
import { STACKS_BLOCKS_PER_DAY } from '~/constants/constants';
import { ProviderId } from '~/data/data';
import { useGetPoxInfoQuery } from '~/features/stacking/hooks/stacking.query';
import {
  LiquidTokenMap,
  ProtocolSlug,
} from '~/features/stacking/start-liquid-stacking/utils/types-preset-protocols';
import {
  getLiquidContract,
  getProtocolBySlug,
  getProtocolIdBySlug,
} from '~/features/stacking/start-liquid-stacking/utils/utils-preset-protocols';
import { getNetworkInstanceByName } from '~/features/stacking/start-pooled-stacking/utils/utils-stacking-pools';
import { useStxMarketDataQuery } from '~/queries/market-data/stx-market-data.query';
import { useProtocolBalance } from '~/queries/protocols/use-protocol-balance';
import { useStackingTrackerProtocol } from '~/queries/stacking-tracker/protocols';
import { useStacksNetwork } from '~/store/stacks-network';

import {
  baseCurrencyAmountInQuote,
  createMoneyFromDecimal,
  i18nFormatCurrency,
} from '@leather.io/utils';

export interface ProtocolInfo {
  logo: ReactNode;
  name: string;
  description: string;
  id: ProviderId;
  slug: ProtocolSlug;
  amount: BigNumber | null;
  apr: number | null;
  tvl?: number | null;
  tvlUsd: string | null;
  payout: string;
  payoutIcon: ReactNode;
  nextCycleDays: number;
  nextCycleNumber: number;
  nextCycleBlocks: number;
  minimumCommitment: number;
  minimumCommitmentUsd: string;
  contractAddress: string;
}

export function useProtocolInfo(protocolSlug: ProtocolSlug) {
  const poxInfoQuery = useGetPoxInfoQuery();
  const balance = useProtocolBalance(protocolSlug);
  const stackingTracker = useStackingTrackerProtocol(protocolSlug);
  const stxMarket = useStxMarketDataQuery();

  const network = useStacksNetwork();

  const isLoading =
    balance?.isLoading ||
    poxInfoQuery.isLoading ||
    stackingTracker.isLoading ||
    stxMarket.isLoading;

  const isError =
    balance?.isError ||
    !balance?.data ||
    poxInfoQuery.isError ||
    !poxInfoQuery.data ||
    stxMarket.isError ||
    !stxMarket.data;

  const info = useMemo(() => {
    if (isLoading || isError) {
      return null;
    }
    const protocol = getProtocolBySlug(protocolSlug);
    const providerId = getProtocolIdBySlug(protocolSlug);
    const payout = LiquidTokenMap[protocol.liquidToken];
    const networkMode = getNetworkInstanceByName(network.networkName);

    const contractAddress = getLiquidContract(networkMode, protocol.liquidContract);

    const tvlBaseCurrencyAmount = stackingTracker.data
      ? baseCurrencyAmountInQuote(
          createMoneyFromDecimal(stackingTracker.data.lastCycle?.token.stacked_amount ?? 0, 'STX'),
          stxMarket.data
        )
      : null;
    const tvlUsd = tvlBaseCurrencyAmount && i18nFormatCurrency(tvlBaseCurrencyAmount);

    const minimumCommitment = 1;
    const minimumCommitmentBaseCurrencyAmount = baseCurrencyAmountInQuote(
      createMoneyFromDecimal(minimumCommitment, 'STX'),
      stxMarket.data
    );
    const minimumCommitmentUsd = i18nFormatCurrency(minimumCommitmentBaseCurrencyAmount);

    const result: ProtocolInfo = {
      nextCycleDays: poxInfoQuery.data.next_cycle.blocks_until_reward_phase / STACKS_BLOCKS_PER_DAY,
      nextCycleNumber: poxInfoQuery.data.next_cycle.id,
      nextCycleBlocks: poxInfoQuery.data.next_cycle.blocks_until_reward_phase,
      logo: <ProviderIcon providerId={providerId} />,

      name: protocol.name,
      description: protocol.description,
      id: providerId,
      slug: protocolSlug,
      amount: balance.data,
      apr: stackingTracker.data?.entity.apr || null,
      tvl: stackingTracker.data?.lastCycle?.token.stacked_amount || null,
      tvlUsd,
      minimumCommitment,
      minimumCommitmentUsd,
      payout,
      payoutIcon: <ChainLogoIcon symbol={payout} />,

      contractAddress,
    };

    return result;
  }, [
    network,
    isError,
    isLoading,
    protocolSlug,
    balance.data,
    stxMarket.data,
    poxInfoQuery.data,
    stackingTracker.data,
  ]);

  if (isLoading) {
    return { isLoading: true } as const;
  }

  if (isError) {
    return { isLoading: false, isError: true } as const;
  }

  return { info, isLoading, isError, balance, poxInfoQuery, stackingTracker };
}
