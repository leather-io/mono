import React, { ReactNode } from 'react';

import { Box, BoxProps, styled } from 'leather-styles/jsx';

interface LinkProps {
  _hover?: BoxProps;
  onClick(): void;
  children: ReactNode;
  fontSize: string;
  textStyle: string;
}

function buildEnterKeyEvent(onClick: () => void) {
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
