import { useRef, useState } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import {
  CheckmarkIcon,
  ChevronDownIcon,
  InfoCircleIcon,
  Popover,
  StarIcon,
  Tooltip,
} from '@leather.io/ui';

import { approvalDirections, findApprovalDirection } from '../directions/direction-registry';
import type { ApprovalDirection } from '../pattern/approval-direction';
import { useCanvasSettings } from './canvas-settings';

const favoriteConceptId = 'handshake';
const pickerDirections = [
  findApprovalDirection(favoriteConceptId),
  ...approvalDirections.filter(item => item.id !== favoriteConceptId),
];

interface ConceptInfoProps {
  concept: ApprovalDirection;
}

function ConceptInfo({ concept }: ConceptInfoProps) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Tooltip.Root open={isOpen} onOpenChange={setOpen}>
      <Tooltip.Trigger asChild>
        <styled.button
          type="button"
          aria-label={`About ${concept.name}`}
          onClick={() => setOpen(current => !current)}
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="32px"
          height="32px"
          borderRadius="xs"
          cursor="pointer"
          color="ink.text-subdued"
          _hover={{ color: 'ink.text-primary', bg: 'ink.component-background-hover' }}
        >
          <InfoCircleIcon variant="small" />
        </styled.button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          collisionPadding={16}
          style={{ width: 360, maxWidth: 'calc(100vw - 32px)', textAlign: 'left' }}
          onEscapeKeyDown={event => event.stopPropagation()}
        >
          <Stack gap="space.02" textStyle="caption.01">
            <styled.span textStyle="label.03">{concept.name}</styled.span>
            <styled.span>{concept.description}</styled.span>
          </Stack>
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function ConceptPicker() {
  const { direction, update } = useCanvasSettings();
  const [isOpen, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = findApprovalDirection(direction);

  function selectConcept(id: string) {
    update({ direction: id, isCompare: false, isViewerCompare: false });
    setOpen(false);
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <styled.button
          ref={triggerRef}
          type="button"
          aria-label={`${current.name}, switch concept`}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="space.02"
          width="100%"
          minWidth="0"
          px="space.03"
          py="space.02"
          borderWidth={1}
          borderColor={isOpen ? 'ink.text-primary' : 'ink.border-default'}
          borderRadius="sm"
          bg="ink.background-primary"
          textAlign="left"
          cursor="pointer"
          _hover={{ borderColor: 'ink.text-primary' }}
        >
          <Stack gap="2px" minWidth="0">
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              Concept
            </styled.span>
            <styled.span textStyle="label.03">{current.name}</styled.span>
          </Stack>
          <ChevronDownIcon variant="small" color="ink.text-subdued" />
        </styled.button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          asChild
          align="start"
          onEscapeKeyDown={event => event.stopPropagation()}
          onKeyDown={event => event.stopPropagation()}
          onCloseAutoFocus={event => {
            event.preventDefault();
            requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
          }}
          aria-label="Switch concept"
        >
          <Stack
            width="272px"
            maxWidth="calc(100vw - 32px)"
            maxHeight="calc(100vh - 48px)"
            overflowY="auto"
            gap="space.01"
            p="space.02"
            borderWidth={1}
            borderColor="ink.border-default"
            bg="ink.background-primary"
          >
            {pickerDirections.map(concept => {
              const isFavorite = concept.id === favoriteConceptId;
              const isSelected = concept.id === current.id;
              return (
                <Flex
                  key={concept.id}
                  alignItems="center"
                  gap="space.01"
                  borderRadius="xs"
                  bg={isSelected ? 'ink.component-background-hover' : 'transparent'}
                >
                  <styled.button
                    type="button"
                    aria-label={`${concept.name}${isFavorite ? ', favorited' : ''}`}
                    aria-pressed={isSelected}
                    onClick={() => selectConcept(concept.id)}
                    display="flex"
                    alignItems="center"
                    gap="space.02"
                    flex="1"
                    minWidth="0"
                    textStyle="label.03"
                    textAlign="left"
                    px="space.02"
                    py="space.02"
                    borderRadius="xs"
                    cursor="pointer"
                    _hover={{ bg: 'ink.component-background-hover' }}
                  >
                    <Box
                      aria-hidden
                      lineHeight={0}
                      color={isFavorite ? 'ink.text-primary' : 'ink.text-subdued'}
                      className={
                        isFavorite ? css({ '& path': { fill: 'currentColor' } }) : undefined
                      }
                    >
                      <StarIcon variant="small" />
                    </Box>
                    <styled.span flex="1">{concept.name}</styled.span>
                    {isSelected && <CheckmarkIcon variant="small" />}
                  </styled.button>
                  <ConceptInfo concept={concept} />
                </Flex>
              );
            })}
          </Stack>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
