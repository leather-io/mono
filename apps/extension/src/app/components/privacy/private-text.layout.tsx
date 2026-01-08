import React from 'react';

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

interface PrivateTextLayoutProps extends HTMLStyledProps<'span'> {
  children: React.ReactNode;
  isPrivate?: boolean;
  onShowValue?(): void;
}

export function PrivateTextLayout({
  isPrivate,
  onShowValue,
  children,
  ...rest
}: PrivateTextLayoutProps) {
  const canShowValue = isPrivate && onShowValue;
  const { fontFamily, letterSpacing, ...spanProps } = rest;

  return (
    <BasicTooltip label="Show value" disabled={!canShowValue} asChild>
      <styled.span
        {...spanProps}
        onClick={canShowValue ? onShowValue : undefined}
        cursor={canShowValue ? 'pointer' : undefined}
        fontFamily={isPrivate ? 'Fira Code, Consolata, monospace' : fontFamily}
        letterSpacing={isPrivate ? '0.05em' : letterSpacing}
      >
        {isPrivate ? '***' : children}
      </styled.span>
    </BasicTooltip>
  );
}
