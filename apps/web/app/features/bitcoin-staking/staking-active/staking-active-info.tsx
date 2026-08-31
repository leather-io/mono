import { Navigate, useLocation } from 'react-router';

import { Flex, VStack } from 'leather-styles/jsx';
import {
  StakingPoolSlug,
  getStakingPoolFromSlug,
  stakingProviderIdToSlug,
} from '~/data/bitcoin-staking-data';
import { usePox5StackingClient } from '~/features/bitcoin-staking/hooks/use-pox5-clients';
import { useIsHydrated } from '~/hooks/use-is-hydrated';
import { byosmPaths, stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { useLeatherConnect } from '~/store/addresses';

import { LoadingSpinner } from '@leather.io/ui';

import { PendingStakePanel } from '../components/pending-stake-panel';
import { PreparePhaseCallout } from '../components/prepare-phase-callout';
import { ClaimableRewardsCard } from './components/claimable-rewards-card';
import { StakingPositionGrid } from './components/staking-position-grid';
import { useActiveStakingInfo } from './hooks/use-active-staking-info';

interface StakingActiveInfoProps {
  poolSlug: StakingPoolSlug;
}

export function StakingActiveInfo({ poolSlug }: StakingActiveInfoProps) {
  const isHydrated = useIsHydrated();
  const client = usePox5StackingClient();
  const { stacksAccount } = useLeatherConnect();

  if (!isHydrated) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (!stacksAccount || !client) return <Navigate to={stakingPaths.index} replace />;

  return <StakingActiveInfoLayout poolSlug={poolSlug} />;
}

function StakingActiveInfoLayout({ poolSlug }: StakingActiveInfoProps) {
  const { isLoading, position, details } = useActiveStakingInfo();
  const { search } = useLocation();
  const fallbackPool = getStakingPoolFromSlug(poolSlug);

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  if (position.status === 'none') {
    return <Navigate to={{ pathname: stakingPaths.pool(poolSlug), search }} replace />;
  }

  if (position.status === 'pending-stake') {
    return (
      <VStack alignItems="stretch" pb="space.03">
        <PendingStakePanel />
      </VStack>
    );
  }

  const positionSlug = position.pool ? stakingProviderIdToSlug(position.pool.providerId) : 'byosm';
  if (positionSlug !== poolSlug) {
    return (
      <Navigate
        to={
          position.pool
            ? stakingPaths.active(positionSlug)
            : byosmPaths.active(position.info.signerManagerContractId)
        }
        replace
      />
    );
  }

  if (!details) {
    return (
      <Flex justifyContent="center" alignItems="center" h="100%">
        <LoadingSpinner fill="ink.text-subdued" />
      </Flex>
    );
  }

  const pool = position.pool ?? fallbackPool;

  return (
    <VStack alignItems="stretch" pb="space.03" gap="space.04">
      {details.isInPreparePhase && (
        <PreparePhaseCallout secondsUntilStakingReopens={details.secondsUntilStakingReopens} />
      )}

      <ClaimableRewardsCard
        providerId={pool.providerId}
        signerManagerContractId={position.info.signerManagerContractId}
        claimable={details.claimable}
      />

      <StakingPositionGrid poolSlug={poolSlug} pool={pool} info={position.info} details={details} />
    </VStack>
  );
}
