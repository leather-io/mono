import { ElementRef, ReactNode, forwardRef } from 'react';

import { Box, HStack, styled } from 'leather-styles/jsx';
import { SystemProperties } from 'leather-styles/types';

type BannerElement = ElementRef<typeof Box>;

export interface BannerProps {
  children: ReactNode;
  icon?: ReactNode;
  maxWidth?: SystemProperties['maxWidth'];
}

export const Banner = forwardRef<BannerElement, BannerProps>(
  ({ children, icon, maxWidth, ...rest }, ref) => {
    return (
      <Box
        px="space.05"
        py="space.04"
        bg="yellow.background-secondary"
        role="status"
        {...rest}
        ref={ref}
      >
        <HStack gap="space.03" justify="space-between" mx="auto" maxWidth={maxWidth}>
          <styled.span textStyle="label.02">{children}</styled.span>
          {icon}
        </HStack>
      </Box>
    );
  }
);

Banner.displayName = 'Banner';
