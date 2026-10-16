import type { ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { Badge, ChevronLeftIcon, ChevronRightIcon } from '@leather.io/ui';

import { displayOrigin } from './approval-format';
import { approvalInteractiveFill } from './approval-surface';

interface QueueStepButtonProps {
  label: string;
  isDisabled: boolean;
  children: ReactNode;
  onPress(): void;
}

function QueueStepButton({ label, isDisabled, children, onPress }: QueueStepButtonProps) {
  return (
    <styled.button
      type="button"
      aria-label={label}
      disabled={isDisabled}
      display="flex"
      width="28px"
      height="28px"
      flexShrink={0}
      alignItems="center"
      justifyContent="center"
      borderRadius="round"
      borderWidth={1}
      borderColor="ink.border-default"
      bg="ink.background-primary"
      color={isDisabled ? 'ink.text-non-interactive' : 'ink.text-primary'}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      lineHeight={0}
      onClick={onPress}
    >
      {children}
    </styled.button>
  );
}

interface ApprovalQueueBarProps {
  position: number;
  total: number;
  origin: string;
  siteChangeNote?: string;
  onPrevious(): void;
  onNext(): void;
}

export function ApprovalQueueBar({
  position,
  total,
  origin,
  siteChangeNote,
  onPrevious,
  onNext,
}: ApprovalQueueBarProps) {
  return (
    <Flex
      alignItems="center"
      gap="space.03"
      px="space.05"
      py="space.02"
      className={approvalInteractiveFill}
      data-approval-zone="queue"
      data-queue-site-changed={siteChangeNote ? 'true' : 'false'}
    >
      <Flex gap="space.01" flexShrink={0}>
        <QueueStepButton label="Previous request" isDisabled={position <= 1} onPress={onPrevious}>
          <ChevronLeftIcon variant="small" />
        </QueueStepButton>
        <QueueStepButton label="Next request" isDisabled={position >= total} onPress={onNext}>
          <ChevronRightIcon variant="small" />
        </QueueStepButton>
      </Flex>
      <Stack gap="0" flex="1" minWidth={0} aria-live="polite">
        <Flex alignItems="center" gap="space.02" minWidth={0}>
          <styled.span textStyle="label.03" truncate>
            {position} of {total} from {displayOrigin(origin)}
          </styled.span>
          {siteChangeNote && <Badge label="New site" variant="warning" flexShrink={0} />}
        </Flex>
        {siteChangeNote && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {siteChangeNote}
          </styled.span>
        )}
      </Stack>
      <styled.button
        type="button"
        textStyle="label.03"
        color="ink.text-primary"
        textDecoration="underline"
        textUnderlineOffset="3px"
        textDecorationColor="ink.border-default"
        cursor="pointer"
        whiteSpace="nowrap"
        flexShrink={0}
      >
        Reject all
      </styled.button>
    </Flex>
  );
}
