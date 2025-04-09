import { useMemo } from 'react';

import { HStack, VStack, styled } from 'leather-styles/jsx';
import { toHumanReadableStx } from '~/utils/unit-convert';

import { Button, CheckmarkCircleIcon, CircleIcon } from '@leather.io/ui';
import { stxToMicroStx } from '@leather.io/utils';

export type ConfirmationStepType = 'terms' | 'allowContractCaller' | 'delegateStx';

export interface ConfirmationStep {
  id: ConfirmationStepType;
  text: string;
  actionText: string;
  state: {
    accepted: boolean;
    loading: boolean;
    visible: boolean;
  };
  onClick: () => void;
}

export interface StackingStepsCardProps {
  poolAmount: number;
  confirmationState: Record<ConfirmationStepType, ConfirmationStep['state']>;
  onSubmit: (confirmation: ConfirmationStepType) => void | Promise<void>;
}

export function StackingStepsCard({
  poolAmount,
  onSubmit,
  confirmationState,
}: StackingStepsCardProps) {
  const confirmationSteps = useMemo<ConfirmationStep[]>(
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

  const currentConfirmation = useMemo<(typeof confirmationSteps)[number] | undefined>(() => {
    return confirmationSteps.find(confirmation => !confirmation.state.accepted);
  }, [confirmationSteps]);

  const stxAmount = stxToMicroStx(poolAmount);

  return (
    <VStack
      alignItems="flex-start"
      py="space.05"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
      gap="space.03"
    >
      <VStack alignItems="flex-start" px="space.05" gap="space.01">
        <styled.h1 textStyle="label.01">You&apos;ll pool up to</styled.h1>
        <styled.span textStyle="heading.04" fontSize="26px" fontWeight={500}>
          {stxAmount.isNaN() ? '—' : toHumanReadableStx(stxAmount)}
        </styled.span>
      </VStack>
      {confirmationSteps
        .filter(confirmation => confirmation.state.visible)
        .map((confirmation, index) => {
          const isCurrent = currentConfirmation?.id === confirmation.id;
          return (
            <HStack
              key={confirmation.id}
              p="space.05"
              borderBottomWidth={index === confirmationSteps.length - 1 ? 0 : 1}
              borderColor="ink.border-default"
              alignItems="flex-start"
              onClick={
                !isCurrent || confirmation.state.loading || confirmation.state.accepted
                  ? undefined
                  : confirmation.onClick
              }
              cursor={
                !isCurrent || confirmation.state.loading || confirmation.state.accepted
                  ? undefined
                  : 'pointer'
              }
            >
              {confirmation.state.accepted ? (
                <CheckmarkCircleIcon variant="medium" />
              ) : (
                <CircleIcon variant="medium" />
              )}
              <VStack alignItems="flex-start" gap="space.02">
                <styled.span textStyle="label.02">{confirmation.text}</styled.span>
                {isCurrent && (
                  <Button
                    disabled={confirmation.state.loading}
                    onClick={event => {
                      event.stopPropagation();
                      confirmation.onClick();
                    }}
                    px="space.06"
                    size="sm"
                  >
                    {confirmation.actionText}
                  </Button>
                )}
              </VStack>
            </HStack>
          );
        })}
    </VStack>
  );
}
