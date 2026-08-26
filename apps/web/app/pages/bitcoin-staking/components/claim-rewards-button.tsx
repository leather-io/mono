import { useMutation } from '@tanstack/react-query';
import { BitcoinStakingProviderId } from '~/data/bitcoin-staking-data';
import { usePox5ClaimableRewards } from '~/features/bitcoin-staking/queries/pox5-stacking.query';
import { createClaimRewardsMutationOptions } from '~/features/bitcoin-staking/transactions/pox5-mutations';
import { wallet } from '~/utils/wallet';

import { Button } from '@leather.io/ui';

interface ClaimRewardsButtonProps {
  providerId: BitcoinStakingProviderId;
  signerManagerContractId: string;
  stakerAddress: string;
}

export function ClaimRewardsButton({
  providerId,
  signerManagerContractId,
  stakerAddress,
}: ClaimRewardsButtonProps) {
  const claimable = usePox5ClaimableRewards();

  const { mutateAsync: claimRewards, isPending } = useMutation(
    createClaimRewardsMutationOptions({ wallet })
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
      data-testid="staking-position-claim-rewards"
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
