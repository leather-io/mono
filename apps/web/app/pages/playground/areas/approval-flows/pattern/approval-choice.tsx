import type { ReactNode } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { type DirectionChoiceProps, useApprovalDirection } from './approval-direction';
import { ApprovalLinesText } from './approval-rows';
import { approvalInteractiveRow } from './approval-surface';

const choiceListDividers = css({
  '& > * + *': { borderTopWidth: 1, borderColor: 'ink.border-default' },
  '[data-approval-containers=interactive] &': {
    gap: 'space.02',
    '& > * + *': { borderTopWidth: 0 },
  },
});

const choiceIconOnFill = css({
  '[data-approval-containers=interactive] &': { bg: 'ink.background-primary' },
});

interface ApprovalChoiceListProps {
  label: string;
  children: ReactNode;
}

export function ApprovalChoiceList({ label, children }: ApprovalChoiceListProps) {
  return (
    <Stack gap="0" role="radiogroup" aria-label={label} className={choiceListDividers}>
      {children}
    </Stack>
  );
}

interface ChoiceIndicatorProps {
  isSelected: boolean;
  isDisabled?: boolean;
}

export function ChoiceIndicator({ isSelected, isDisabled }: ChoiceIndicatorProps) {
  return (
    <Flex
      width="20px"
      height="20px"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      borderWidth={2}
      borderColor={isSelected ? 'ink.action-primary-default' : 'ink.border-default'}
      opacity={isDisabled ? 0.5 : 1}
      aria-hidden
    >
      {isSelected && (
        <Box width="10px" height="10px" borderRadius="round" bg="ink.action-primary-default" />
      )}
    </Flex>
  );
}

function BaselineChoice({
  label,
  icon,
  caption,
  badge,
  value,
  valueCaption,
  isSelected,
  isDisabled,
  children,
  onSelect,
}: DirectionChoiceProps) {
  return (
    <Stack gap="0" className={isDisabled ? undefined : approvalInteractiveRow}>
      <styled.button
        type="button"
        role="radio"
        aria-checked={isSelected}
        disabled={isDisabled}
        display="flex"
        width="100%"
        alignItems="flex-start"
        gap="space.03"
        py="space.03"
        textAlign="left"
        cursor={isDisabled ? 'not-allowed' : 'pointer'}
        onClick={onSelect}
      >
        <Box pt="1px">
          <ChoiceIndicator isSelected={isSelected} isDisabled={isDisabled} />
        </Box>
        {icon && (
          <Flex
            width="32px"
            height="32px"
            flexShrink={0}
            alignItems="center"
            justifyContent="center"
            borderRadius="round"
            bg="ink.component-background-default"
            mt="-6px"
            aria-hidden
            className={choiceIconOnFill}
          >
            {icon}
          </Flex>
        )}
        <Stack gap="0" flex="1" minWidth={0}>
          <Flex alignItems="center" gap="space.02" flexWrap="wrap">
            <styled.span
              textStyle="label.02"
              color={isDisabled ? 'ink.text-non-interactive' : 'ink.text-primary'}
            >
              {label}
            </styled.span>
            {badge}
          </Flex>
          {caption && (
            <styled.span textStyle="caption.01" color="ink.text-subdued">
              <ApprovalLinesText lines={caption} />
            </styled.span>
          )}
        </Stack>
        {value && (
          <Stack gap="0" alignItems="flex-end" textAlign="right" flexShrink={0}>
            <styled.span
              textStyle="label.02"
              color={isDisabled ? 'ink.text-non-interactive' : 'ink.text-primary'}
            >
              {value}
            </styled.span>
            {valueCaption && (
              <styled.span textStyle="caption.01" color="ink.text-subdued">
                {valueCaption}
              </styled.span>
            )}
          </Stack>
        )}
      </styled.button>
      {isSelected && children && (
        <Box pl="32px" pb="space.03">
          {children}
        </Box>
      )}
    </Stack>
  );
}

export function ApprovalChoice(props: DirectionChoiceProps) {
  const Choice = useApprovalDirection()?.Choice ?? BaselineChoice;
  return <Choice {...props} />;
}
