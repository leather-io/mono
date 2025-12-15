import React, { type ReactNode } from 'react';

import { Box, type BoxProps, styled } from 'leather-styles/jsx';

interface LinkProps extends BoxProps {
  _hover?: BoxProps;
  onClick(): void;
  children: ReactNode;
  fontSize?: string;
  textStyle?: string;
}

export function buildEnterKeyEvent(onClick: () => void) {
  return (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && onClick) {
      onClick();
    }
  };
}

export function Link({
  _hover = {},
  children,
  fontSize = '12px',
  textStyle = 'caption.medium',
  onClick,
  ...rest
}: LinkProps) {
  return (
    <Box {...rest} onKeyPress={buildEnterKeyEvent(onClick)} onClick={onClick} tabIndex={0}>
      <styled.span
        _hover={{ textDecoration: 'underline', cursor: 'pointer', ..._hover }}
        fontSize={fontSize}
        textStyle={textStyle}
      >
        {children}
      </styled.span>
    </Box>
  );
}

export function MediumLink({ children, fontSize = '14px', ...rest }: LinkProps) {
  return (
    <Link fontSize={fontSize} {...rest}>
      {children}
    </Link>
  );
}
