import { useMemo } from 'react';

import { VStack, styled } from 'leather-styles/jsx';
import {
  ConfirmationStep,
  ConfirmationSteps,
  PooledStackingConfirmationStepId,
} from '~/components/confirmations/confirmation-steps';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { stxToMicroStx } from '@leather.io/utils';

export interface PooledStackingConfirmationStepsProps {
  poolAmount: number;
  confirmationState: Record<
    PooledStackingConfirmationStepId,
    ConfirmationStep<PooledStackingConfirmationStepId>['state']
  >;
  onSubmit: (confirmation: PooledStackingConfirmationStepId) => void | Promise<void>;
}

export function PooledStackingConfirmationSteps({
  poolAmount,
  onSubmit,
  confirmationState,
}: PooledStackingConfirmationStepsProps) {
  const confirmationSteps = useMemo<ConfirmationStep<PooledStackingConfirmationStepId>[]>(
    () => [
      {
        id: 'terms',
        text: 'I have read and accepted the pool’s terms and conditions',
        actionText: 'Confirm',
        state: confirmationState['terms'],
        onClick: () => onSubmit('terms'),
      },
      {
        id: 'allowContractCaller',
        text: 'Allow the pool contract to interact with your wallet',
        actionText: 'Allow',
        state: confirmationState['allowContractCaller'],
        onClick: () => onSubmit('allowContractCaller'),
      },
      {
        id: 'delegateStx',
        text: 'Confirm and start pooling',
        actionText: 'Confirm',
        state: confirmationState['delegateStx'],
        onClick: () => onSubmit('delegateStx'),
      },
    ],
    [onSubmit, confirmationState]
  );

  const stxAmount = stxToMicroStx(poolAmount);

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
          <styled.h1 textStyle="label.01">You&apos;ll pool up to</styled.h1>
          <styled.span textStyle="heading.04" fontSize="26px" fontWeight={500}>
            {stxAmount.isNaN() ? '—' : toHumanReadableStx(stxAmount)}
          </styled.span>
        </VStack>
      }
      confirmationSteps={confirmationSteps}
    />
  );
}
