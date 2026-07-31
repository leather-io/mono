import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import {
  BitcoinStakingPool,
  BitcoinStakingProviderId,
  StakingPoolSlug,
  getPoolBySignerManager,
  stakingProviderIdToSlug,
} from '~/data/bitcoin-staking-data';
import { usePox5Position } from '~/features/bitcoin-staking/hooks/use-pox5-position';
import { usePox5ClaimableRewards } from '~/features/bitcoin-staking/queries/pox5-stacking.query';
import { createClaimRewardsMutationOptions } from '~/features/bitcoin-staking/transactions/pox5-mutations';
import { useLeatherConnect } from '~/store/addresses';
import { leather } from '~/utils/leather-sdk';

import { Button, useOnMount } from '@leather.io/ui';

interface ClaimRewardsButtonProps {
  slug: StakingPoolSlug;
}

function resolveClaimProviderId(
  slug: StakingPoolSlug,
  positionPool: BitcoinStakingPool | undefined
): BitcoinStakingProviderId | null {
  if (slug === 'byosm') return positionPool ? null : 'byosm';
  if (positionPool && stakingProviderIdToSlug(positionPool.providerId) === slug) {
    return positionPool.providerId;
  }
  return null;
}

// Table-row companion to the active-position ClaimableRewardsCard: rendered
// only when the connected account's position is in this pool AND it has
// claimable rewards. Split in two because usePox5ClaimableRewards transitively
// requires a connected StackingClient (usePox5StackingClientRequired throws
// without one) — the outer gate uses only null-safe hooks so the table can
// server-render for disconnected visitors; the inner part mounts client-side
// once an account and an active position in this pool exist.
export function ClaimRewardsButton({ slug }: ClaimRewardsButtonProps) {
  const [isClient, setIsClient] = useState(false);
  useOnMount(() => setIsClient(true));

  const { stacksAccount } = useLeatherConnect();
  const { position } = usePox5Position();

  if (!isClient || !stacksAccount || position?.status !== 'active') return null;

  const positionPool = getPoolBySignerManager(position.info.signerManagerContractId);
  const providerId = resolveClaimProviderId(slug, positionPool);
  if (!providerId) return null;

  return (
    <ClaimRewardsButtonInner
      slug={slug}
      providerId={providerId}
      signerManagerContractId={position.info.signerManagerContractId}
      stakerAddress={stacksAccount.address}
    />
  );
}

interface ClaimRewardsButtonInnerProps {
  slug: StakingPoolSlug;
  providerId: BitcoinStakingProviderId;
  signerManagerContractId: string;
  stakerAddress: string;
}

function ClaimRewardsButtonInner({
  slug,
  providerId,
  signerManagerContractId,
  stakerAddress,
}: ClaimRewardsButtonInnerProps) {
  const claimable = usePox5ClaimableRewards();

  const { mutateAsync: claimRewards, isPending } = useMutation(
    createClaimRewardsMutationOptions({ leather })
  );

  // Claims are per-cycle transactions; claim the oldest unclaimed cycle first.
  const oldestUnclaimed = claimable.byCycle[0];
  if (claimable.isLoading || !oldestUnclaimed) return null;

  return (
    <Button
      size="sm"
      variant="ghost"
      minW="fit-content"
      disabled={isPending}
      data-testid={`claim-rewards-button-${slug}`}
      onClick={() =>
        claimRewards({
          providerId,
          signerManagerContractId,
          stakerAddress,
          rewardCycle: oldestUnclaimed.cycle,
        })
      }
    >
      Claim rewards
    </Button>
  );
}
