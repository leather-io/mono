import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useMutation } from '@tanstack/react-query';
import { Flex, FlexProps } from 'leather-styles/jsx';
import { StopPoolingIcon } from '~/components/icons/stop-pooling-icon';
import { BitcoinStakingProviderId, StakingPoolSlug } from '~/data/bitcoin-staking-data';
import { usePox5StackingClientRequired } from '~/features/bitcoin-staking/hooks/use-pox5-clients';
import { stakingPaths } from '~/pages/bitcoin-staking/bitcoin-staking.constants';
import { leather } from '~/utils/leather-sdk';

import { Button } from '@leather.io/ui';

import { createUnstakeMutationOptions } from '../../transactions/pox5-unstake';

interface StakingActionButtonsProps extends FlexProps {
  poolSlug: StakingPoolSlug;
  providerId: BitcoinStakingProviderId;
  signerManagerContractId: string;
  actionsDisabled: boolean;
}

export function StakingActionButtons({
  poolSlug,
  providerId,
  signerManagerContractId,
  actionsDisabled,
  ...flexProps
}: StakingActionButtonsProps) {
  const navigate = useNavigate();
  const client = usePox5StackingClientRequired();
  // Unstaking is all-or-nothing and irreversible until the cycle ends, so the
  // first click arms the button and only a second click submits.
  const [unstakeArmed, setUnstakeArmed] = useState(false);

  const { mutateAsync: unstake, isPending } = useMutation(
    createUnstakeMutationOptions({ leather, client })
  );

  async function handleUnstakeClick() {
    if (!unstakeArmed) {
      setUnstakeArmed(true);
      return;
    }
    return unstake({ providerId, currentSignerManagerContractId: signerManagerContractId }).then(
      () => navigate(stakingPaths.index)
    );
  }

  return (
    <Flex gap="space.04" {...flexProps}>
      <Button
        size="md"
        variant="ghost"
        iconStart={<StopPoolingIcon width="16" height="16" />}
        onClick={handleUnstakeClick}
        disabled={isPending || actionsDisabled}
        data-testid="unstake-button"
      >
        {unstakeArmed ? 'Confirm unstake' : 'Unstake'}
      </Button>
      <Button
        size="md"
        onClick={() => navigate(stakingPaths.update(poolSlug))}
        disabled={actionsDisabled}
        data-testid="update-stake-button"
      >
        Update stake
      </Button>
    </Flex>
  );
}
