import { useMemo } from 'react';

import { VStack, styled } from 'leather-styles/jsx';
import { ConfirmationStep, ConfirmationSteps } from '~/components/confirmations/confirmation-steps';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { stxToMicroStx } from '@leather.io/utils';

export type StartStakingStepId = 'terms' | 'stake';

interface StakingConfirmationStepsProps {
  stakeAmount: number;
  cycles: number;
  estimatedUnlockDate: Date | null;
  confirmationState: Record<StartStakingStepId, ConfirmationStep<StartStakingStepId>['state']>;
  onSubmit(confirmation: StartStakingStepId): void | Promise<void>;
}

export function StakingConfirmationSteps({
  stakeAmount,
  cycles,
  estimatedUnlockDate,
  onSubmit,
  confirmationState,
}: StakingConfirmationStepsProps) {
  const confirmationSteps = useMemo<ConfirmationStep<StartStakingStepId>[]>(
    () => [
      {
        id: 'terms',
        text: 'I have read and accepted the pool’s terms and conditions',
        actionText: 'Confirm',
        state: confirmationState['terms'],
        onClick: () => onSubmit('terms'),
      },
      {
        id: 'stake',
        text: 'Confirm and start staking',
        actionText: 'Confirm',
        state: confirmationState['stake'],
        onClick: () => onSubmit('stake'),
      },
    ],
    [onSubmit, confirmationState]
  );

  const stxAmount = stxToMicroStx(stakeAmount);
  const hasCycles = Number.isInteger(cycles) && cycles > 0;

  return (
    <ConfirmationSteps
      preview={
        <VStack
          alignItems="flex-start"
          px={['space.05', null, 'space.03', 'space.05']}
          pt={['space.05', null, '0']}
          pb={['space.03', null, '0']}
          gap="space.01"
        >
          <styled.h1 textStyle="label.01">You&apos;ll lock</styled.h1>
          <styled.span textStyle="heading.04" fontSize="26px" fontWeight={500}>
            {stxAmount.isNaN() ? '—' : toHumanReadableMicroStx(stxAmount)}
          </styled.span>
          {hasCycles && (
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              {cycles === 1 ? '1 cycle' : `${cycles} cycles`}
              {estimatedUnlockDate && <> · unlocks ~{estimatedUnlockDate.toLocaleDateString()}</>}
            </styled.span>
          )}
        </VStack>
      }
      confirmationSteps={confirmationSteps}
    />
  );
}
