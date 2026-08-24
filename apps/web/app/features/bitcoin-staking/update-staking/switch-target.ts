import {
  BitcoinStakingProviderId,
  StakingPoolSlug,
  getStakingPoolFromSlug,
  isPoolAvailableOnNetwork,
  stakingPoolSlugSchema,
} from '~/data/bitcoin-staking-data';
import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';
import { switchTargetParam } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

interface ParseSwitchTargetSlugArgs {
  search: string;
  currentProviderId: BitcoinStakingProviderId;
  networkMode: NetworkMode;
}

export function parseSwitchTargetSlug({
  search,
  currentProviderId,
  networkMode,
}: ParseSwitchTargetSlugArgs): StakingPoolSlug | null {
  const raw = new URLSearchParams(search).get(switchTargetParam);
  const parsed = stakingPoolSlugSchema.safeParse(raw);
  if (!parsed.success) return null;
  if (parsed.data === 'byosm') return null;

  const pool = getStakingPoolFromSlug(parsed.data);
  if (pool.providerId === currentProviderId) return null;
  if (!isPoolAvailableOnNetwork(pool, networkMode)) return null;

  return parsed.data;
}
