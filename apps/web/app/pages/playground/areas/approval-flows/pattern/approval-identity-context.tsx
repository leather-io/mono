import { styled } from 'leather-styles/jsx';

import { Badge, CheckmarkCircleIcon, ErrorTriangleIcon, InfoCircleIcon } from '@leather.io/ui';

export interface ApprovalIdentityContext {
  status: 'clear' | 'neutral' | 'caution' | 'blocked';
  label: string;
  description: string;
}

interface ApprovalIdentityContextBadgeProps {
  context: ApprovalIdentityContext;
}

const contextVariants = {
  clear: 'success',
  neutral: 'default',
  caution: 'warning',
  blocked: 'error',
} satisfies Record<ApprovalIdentityContext['status'], 'success' | 'default' | 'warning' | 'error'>;

function IdentityContextIcon({ context }: ApprovalIdentityContextBadgeProps) {
  if (context.status === 'clear') {
    return <CheckmarkCircleIcon variant="small" color="green.action-primary-default" />;
  }
  if (context.status === 'caution') {
    return <ErrorTriangleIcon variant="small" color="yellow.action-primary-default" />;
  }
  if (context.status === 'blocked') {
    return <ErrorTriangleIcon variant="small" color="red.action-primary-default" />;
  }
  return <InfoCircleIcon variant="small" color="ink.text-subdued" />;
}

export function ApprovalIdentityContextBadge({ context }: ApprovalIdentityContextBadgeProps) {
  return (
    <Badge
      as="span"
      label={context.label}
      title={context.description}
      icon={<IdentityContextIcon context={context} />}
      variant={contextVariants[context.status]}
      outlined
      flexShrink={0}
      data-identity-context={context.status}
    />
  );
}

export function ApprovalIdentityContextMark({ context }: ApprovalIdentityContextBadgeProps) {
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      flexShrink={0}
      lineHeight={0}
      role="img"
      aria-label={`${context.label}. ${context.description}`}
      title={`${context.label}. ${context.description}`}
      data-identity-context={context.status}
    >
      <IdentityContextIcon context={context} />
    </styled.span>
  );
}
