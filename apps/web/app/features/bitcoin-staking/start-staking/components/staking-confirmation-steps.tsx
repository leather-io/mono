import { useMemo } from 'react';

import { VStack, styled } from 'leather-styles/jsx';
import { ConfirmationStep, ConfirmationSteps } from '~/components/confirmations/confirmation-steps';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { stxToMicroStx } from '@leather.io/utils';

import { StakingConnectAction } from '../../hooks/use-staking-connect-action';

export type StartStakingStepId = 'connect' | 'terms' | 'stake';

const { connectGate } = bitcoinStakingContent;

interface StakingConfirmationStepsProps {
  stakeAmount: number;
  cycles: number;
  estimatedUnlockDate: Date | null;
  connectAction: StakingConnectAction;
  confirmationState: Record<StartStakingStepId, ConfirmationStep<StartStakingStepId>['state']>;
  onSubmit(confirmation: StartStakingStepId): void | Promise<void>;
}

export function StakingConfirmationSteps({
  stakeAmount,
  cycles,
  estimatedUnlockDate,
  connectAction,
  onSubmit,
  confirmationState,
}: StakingConfirmationStepsProps) {
  const connectStep = useMemo<ConfirmationStep<StartStakingStepId> | null>(() => {
    if (connectAction.status === 'connected') return null;
    const needsInstall = connectAction.status === 'install';
    return {
      id: 'connect',
      text: needsInstall ? connectGate.installStep : connectGate.connectStep,
      actionText: needsInstall ? connectGate.installAction : connectGate.connectAction,
      state: confirmationState['connect'],
      onClick: () => onSubmit('connect'),
    };
  }, [connectAction.status, confirmationState, onSubmit]);

  const confirmationSteps = useMemo<ConfirmationStep<StartStakingStepId>[]>(
    () => [
      ...(connectStep ? [connectStep] : []),
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
    [connectStep, onSubmit, confirmationState]
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
