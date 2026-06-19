import { memo } from 'react';

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { shimmerStyles } from '@leather.io/ui';

interface AccountNameLayoutProps extends HTMLStyledProps<'span'> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const AccountNameLayout = memo(function AccountNameLayout({
  children,
  isLoading,
  ...rest
}: AccountNameLayoutProps) {
  return (
    <styled.span
      className={shimmerStyles}
      textStyle="label.02"
      minWidth={0}
      maxWidth="100%"
      overflow="hidden"
      whiteSpace="nowrap"
      textOverflow="ellipsis"
      aria-busy={isLoading}
      data-state={isLoading ? 'loading' : undefined}
      {...rest}
    >
      {children}
    </styled.span>
  );
});
