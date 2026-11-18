import { styled } from 'leather-styles/jsx';

import { Callout, type CalloutProps } from '@leather.io/ui';

export interface PageNoticeProps {
  variant: NonNullable<CalloutProps['variant']>;
  message: string;
}

export function PageNotice({ variant, message }: PageNoticeProps) {
  return (
    <Callout
      variant={variant}
      role={variant === 'error' ? 'alert' : 'status'}
      mx="calc(0px - {spacing.space.05})"
      flexShrink={0}
      overflowWrap="anywhere"
    >
      <styled.span color="ink.text-secondary">{message}</styled.span>
    </Callout>
  );
}
