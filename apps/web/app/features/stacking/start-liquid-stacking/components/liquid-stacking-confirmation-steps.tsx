import { useMemo } from 'react';

import { VStack, styled } from 'leather-styles/jsx';
import {
  ConfirmationStep,
  ConfirmationSteps,
  LiquidStackingConfirmationStepId,
} from '~/components/confirmations/confirmation-steps';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { stxToMicroStx } from '@leather.io/utils';

export interface LiquidStackingConfirmationStepsProps {
  stackingAmount: number;
  confirmationState: Record<
    LiquidStackingConfirmationStepId,
    ConfirmationStep<LiquidStackingConfirmationStepId>['state']
  >;
  onSubmit: (confirmation: LiquidStackingConfirmationStepId) => void | Promise<void>;
}

export function LiquidStackingConfirmationSteps({
  stackingAmount,
  onSubmit,
  confirmationState,
}: LiquidStackingConfirmationStepsProps) {
  const confirmationSteps = useMemo<ConfirmationStep<LiquidStackingConfirmationStepId>[]>(
    () => [
      {
        id: 'terms',
        text: 'I have read and accepted the protocol’s terms and conditions',
        actionText: 'Confirm',
        state: confirmationState['terms'],
        onClick: () => onSubmit('terms'),
      },
      {
        id: 'depositStx',
        text: 'Confirm and start liquid stacking',
        actionText: 'Confirm',
        state: confirmationState['depositStx'],
        onClick: () => onSubmit('depositStx'),
      },
    ],
    [onSubmit, confirmationState]
  );

  const stxAmount = stxToMicroStx(stackingAmount);

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
          <styled.h1 textStyle="label.01">You&apos;ll liquid stack</styled.h1>
          <styled.span textStyle="heading.04" fontSize="26px" fontWeight={500}>
            {stxAmount.isNaN() ? '—' : toHumanReadableStx(stxAmount)}
          </styled.span>
        </VStack>
      }
      confirmationSteps={confirmationSteps}
    />
  );
}
