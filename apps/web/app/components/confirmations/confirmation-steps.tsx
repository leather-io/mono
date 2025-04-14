import { ReactNode, useMemo } from 'react';

import { Box, HStack, VStack, styled } from 'leather-styles/jsx';

import { Button, CheckmarkCircleIcon, CircleIcon } from '@leather.io/ui';

export type PooledStackingConfirmationStepId = 'terms' | 'allowContractCaller' | 'delegateStx';

export type LiquidStackingConfirmationStepId = 'terms' | 'depositStx';

export type ConfirmationStepId =
  | PooledStackingConfirmationStepId
  | LiquidStackingConfirmationStepId;

export interface ConfirmationStep<T extends ConfirmationStepId> {
  id: T;
  text: string;
  actionText: string;
  state: {
    accepted: boolean;
    loading: boolean;
    visible: boolean;
  };
  onClick: () => void;
}

export interface ConfirmationStepsProps<T extends ConfirmationStepId> {
  preview: ReactNode;
  confirmationSteps: ConfirmationStep<T>[];
}

export function ConfirmationSteps<T extends ConfirmationStepId>({
  confirmationSteps,
  preview,
}: ConfirmationStepsProps<T>) {
  const currentConfirmationStep = useMemo<(typeof confirmationSteps)[number] | undefined>(() => {
    return confirmationSteps.find(confirmationStep => !confirmationStep.state.accepted);
  }, [confirmationSteps]);

  return (
    <VStack
      alignItems="flex-start"
      py={[null, null, 'space.03', 'space.05']}
      borderWidth={[0, null, 1]}
      borderColor="ink.border-default"
      borderRadius="sm"
      gap={[null, null, 'space.03']}
    >
      {preview}
      {confirmationSteps
        .filter(confirmation => confirmation.state.visible)
        .map((confirmation, index) => {
          const isCurrent = currentConfirmationStep?.id === confirmation.id;
          return (
            <HStack
              key={confirmation.id}
              p={['space.05', null, 'space.03', 'space.05']}
              w={['100%', null, 'auto']}
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
              <Box flexShrink={0}>
                {confirmation.state.accepted ? (
                  <CheckmarkCircleIcon variant="medium" />
                ) : (
                  <CircleIcon variant="medium" />
                )}
              </Box>
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
