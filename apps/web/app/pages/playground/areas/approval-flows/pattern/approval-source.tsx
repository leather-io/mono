import type { ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

import { CheckmarkCircleIcon, ErrorTriangleIcon, InfoCircleIcon } from '@leather.io/ui';

import { useApprovalDirection } from './approval-direction';
import { BaselineCheckRow } from './approval-notices';

type ApprovalSourceStatus = 'clear' | 'neutral' | 'caution' | 'blocked';

interface SourceStatusIconProps {
  status: ApprovalSourceStatus;
}

function SourceStatusIcon({ status }: SourceStatusIconProps) {
  if (status === 'clear') {
    return <CheckmarkCircleIcon variant="small" color="green.action-primary-default" />;
  }
  if (status === 'caution') {
    return <ErrorTriangleIcon variant="small" color="yellow.action-primary-default" />;
  }
  if (status === 'blocked') {
    return <ErrorTriangleIcon variant="small" color="red.action-primary-default" />;
  }
  return <InfoCircleIcon variant="small" color="ink.text-subdued" />;
}

interface ApprovalSourceCheckProps {
  status: ApprovalSourceStatus;
  title: string;
  caption?: ReactNode;
}

export function ApprovalSourceCheck({ status, title, caption }: ApprovalSourceCheckProps) {
  const direction = useApprovalDirection();
  const Row = direction?.CheckRow ?? BaselineCheckRow;
  return (
    <Box data-source-status={status}>
      <Row icon={<SourceStatusIcon status={status} />} title={title} caption={caption} />
    </Box>
  );
}
