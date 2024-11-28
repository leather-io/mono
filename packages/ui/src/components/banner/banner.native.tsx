import { ElementRef, ReactNode, forwardRef } from 'react';

import { Box } from '../box/box.native';
import { Text } from '../text/text.native';

type BannerElement = ElementRef<typeof Box>;

export interface BannerProps {
  children: ReactNode;
  icon?: ReactNode;
}

export const Banner = forwardRef<BannerElement, BannerProps>(({ children, icon, ...rest }, ref) => {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      gap="3"
      px="5"
      py="4"
      bg="yellow.background-secondary"
      role="status"
      {...rest}
      ref={ref}
    >
      <Text variant="label02" style={{ flexShrink: 1 }}>
        {children}
      </Text>
      {icon}
    </Box>
  );
});
