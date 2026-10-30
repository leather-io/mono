import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { Badge, ErrorTriangleIcon } from '@leather.io/ui';

import type { ApprovalRecipientName } from './approval-direction';

interface ApprovalRecipientNameProps {
  name: ApprovalRecipientName;
  showKind?: boolean;
}

export function ApprovalRecipientNameValue({ name, showKind = true }: ApprovalRecipientNameProps) {
  return (
    <Flex
      as="span"
      alignItems="center"
      gap="space.02"
      flexWrap="wrap"
      minWidth={0}
      data-approval-zone="recipient-name"
      data-recipient-name={name.kind}
    >
      <styled.span textStyle="label.02" overflowWrap="anywhere">
        {name.value}
        {showKind && name.kind === 'yours' && (
          <styled.span textStyle="label.02" fontWeight={400} color="ink.text-subdued">
            {' '}
            · yours
          </styled.span>
        )}
      </styled.span>
      {showKind && name.kind === 'bns' && (
        <Badge label="BNS name" variant="info" outlined flexShrink={0} />
      )}
    </Flex>
  );
}

export function ApprovalRecipientNameNotes({ name }: ApprovalRecipientNameProps) {
  if (!name.source && !name.caution) return null;
  return (
    <Stack gap="space.01">
      {name.source && (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {name.source}
        </styled.span>
      )}
      {name.caution && (
        <Flex gap="space.01" alignItems="flex-start" data-approval-zone="recipient-name-caution">
          <Box flexShrink={0} pt="2px" lineHeight={0}>
            <ErrorTriangleIcon variant="small" color="yellow.action-primary-default" />
          </Box>
          <styled.span textStyle="caption.01" color="ink.text-primary">
            {name.caution}
          </styled.span>
        </Flex>
      )}
    </Stack>
  );
}

export function ApprovalRecipientNameBlock({ name, showKind = true }: ApprovalRecipientNameProps) {
  return (
    <Stack gap="space.01">
      <ApprovalRecipientNameValue name={name} showKind={showKind} />
      <ApprovalRecipientNameNotes name={name} />
    </Stack>
  );
}
