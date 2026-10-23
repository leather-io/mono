import { type ReactNode } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { StakingConfirmMessage } from '../../components/staking-confirm-message';
import {
  shakeKeyframes,
  shakeTiming,
  useAttentionAnimation,
} from '../../hooks/use-attention-animation';

interface SidebarSummaryValueRow {
  kind: 'value';
  label: string;
  value: string;
  caption?: string;
}

interface SidebarSummaryDiffRow {
  kind: 'diff';
  label: string;
  from: string;
  to: string;
  isCritical?: boolean;
}

export type SidebarSummaryRow = SidebarSummaryValueRow | SidebarSummaryDiffRow;

interface SidebarSummaryCardProps {
  rows: SidebarSummaryRow[];
  acknowledgment?: ReactNode;
  confirmLabel: string;
  confirmError?: string;
  confirmAttemptCount?: number;
  confirmDisabled?: boolean;
  confirmTestId?: string;
  isBusy?: boolean;
  onConfirm(): void;
}

function SidebarSummaryRowContent({ row }: { row: SidebarSummaryRow }) {
  if (row.kind === 'value') {
    return (
      <>
        <styled.span textStyle="body.02" color="ink.text-primary">
          {row.value}
        </styled.span>
        {row.caption && (
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            {row.caption}
          </styled.span>
        )}
      </>
    );
  }

  return (
    <Flex alignItems="baseline" columnGap="space.03" rowGap="space.01" flexWrap="wrap">
      <styled.span textStyle="body.02" color="ink.text-subdued" textDecoration="line-through">
        {row.from}
      </styled.span>
      <styled.span textStyle="body.02" color="ink.text-non-interactive">
        →
      </styled.span>
      <styled.span
        textStyle="label.02"
        color={row.isCritical ? 'red.action-primary-default' : 'ink.text-primary'}
      >
        {row.to}
      </styled.span>
    </Flex>
  );
}

export function SidebarSummaryCard({
  rows,
  acknowledgment,
  confirmLabel,
  confirmError,
  confirmAttemptCount = 0,
  confirmDisabled = false,
  confirmTestId,
  isBusy = false,
  onConfirm,
}: SidebarSummaryCardProps) {
  const buttonRef = useAttentionAnimation<HTMLDivElement>(
    confirmAttemptCount,
    shakeKeyframes,
    shakeTiming
  );

  return (
    <Box
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="md"
      bg="ink.background-primary"
      overflow="hidden"
    >
      <Box px="space.05" pt="space.05" pb="space.03">
        <styled.h3 textStyle="label.01">Summary</styled.h3>
      </Box>

      {rows.map((row, index) => (
        <Stack
          key={row.label}
          gap="space.01"
          px="space.05"
          py="space.03"
          borderBottomWidth={index === rows.length - 1 ? 0 : 1}
          borderBottomColor="ink.border-default"
        >
          <styled.span textStyle="body.02" color="ink.text-subdued">
            {row.label}
          </styled.span>
          <SidebarSummaryRowContent row={row} />
        </Stack>
      ))}

      <Stack gap="space.05" p="space.05" borderTopWidth={1} borderTopColor="ink.border-default">
        {acknowledgment}
        <Stack>
          <styled.div ref={buttonRef}>
            <Button
              size="md"
              fullWidth
              disabled={confirmDisabled || isBusy}
              aria-busy={isBusy || undefined}
              onClick={onConfirm}
              data-testid={confirmTestId}
            >
              {confirmLabel}
            </Button>
          </styled.div>
          <StakingConfirmMessage message={confirmError} />
        </Stack>
      </Stack>
    </Box>
  );
}
