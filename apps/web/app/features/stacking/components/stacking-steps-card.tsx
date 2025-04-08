import { useMemo, useState } from 'react';

import { HStack, VStack, styled } from 'leather-styles/jsx';

import { Button, CheckmarkCircleIcon, CircleIcon } from '@leather.io/ui';

export interface StackingStepsCardProps {
  poolAmount: string;
}

const confirmations = [
  {
    id: 'terms-and-conditions',
    text: 'I have read and accepted the pool&apos;s terms and conditions',
  },
  {
    id: 'interact-wallet',
    text: 'Allow the pool contract to interact with your wallet',
  },
  {
    id: 'confirm',
    text: 'Confirm and start pooling',
  },
] as const;

export function StackingStepsCard({ poolAmount }: StackingStepsCardProps) {
  const [acceptedConfirmations, setAcceptedConfirmations] = useState<string[]>([]);

  const currentConfirmation = useMemo<(typeof confirmations)[number] | undefined>(() => {
    const lastAcceptedId = acceptedConfirmations[acceptedConfirmations.length - 1];
    const lastAcceptedIndex = confirmations.findIndex(conf => conf.id === lastAcceptedId);
    const nextIndex = lastAcceptedIndex + 1;
    return confirmations[nextIndex];
  }, [acceptedConfirmations]);

  function handleConfirmation(confirmationId: string) {
    setAcceptedConfirmations(prev => [...prev, confirmationId]);
  }

  return (
    <VStack
      alignItems="flex-start"
      py="space.05"
      borderWidth={1}
      borderColor="ink.border-default"
      gap="space.03"
    >
      <VStack alignItems="flex-start" px="space.05" gap="space.01">
        <styled.h1 textStyle="label.01">You&apos;ll pool up to</styled.h1>
        <styled.span textStyle="heading.04" fontSize="26px" fontWeight={500}>
          {poolAmount} STX
        </styled.span>
      </VStack>
      {confirmations.map((confirmation, index) => {
        const isAccepted = acceptedConfirmations.includes(confirmation.id);
        return (
          <HStack
            key={confirmation.id}
            p="space.05"
            borderBottomWidth={index === confirmations.length - 1 ? 0 : 1}
            borderColor="ink.border-default"
            alignItems="flex-start"
          >
            {isAccepted ? (
              <CheckmarkCircleIcon variant="medium" />
            ) : (
              <CircleIcon variant="medium" />
            )}
            <VStack alignItems="flex-start" gap="space.02">
              <styled.span textStyle="label.02">{confirmation.text}</styled.span>
              {currentConfirmation?.id === confirmation.id && (
                <Button px="space.06" size="sm" onClick={() => handleConfirmation(confirmation.id)}>
                  Confirm
                </Button>
              )}
            </VStack>
          </HStack>
        );
      })}
    </VStack>
  );
}
