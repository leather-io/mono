import {
  StakingPoolSlug,
  getPoolBySignerManager,
  stakingProviderIdToSlug,
} from '~/data/bitcoin-staking-data';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

interface StakingPoolLink {
  isLoading: boolean;
  to: string | null;
}

export function useStakingPoolLink(slug: StakingPoolSlug): StakingPoolLink {
  const { isLoading, position } = usePox5Position();

  if (isLoading) return { isLoading: true, to: null };

  if (position.status === 'active') {
    const positionPool = getPoolBySignerManager(position.info.signerManagerContractId);
    const isThisPool = positionPool && stakingProviderIdToSlug(positionPool.providerId) === slug;
    return { isLoading: false, to: isThisPool ? stakingPaths.active(slug) : null };
  }

  return { isLoading: false, to: stakingPaths.pool(slug) };
}
