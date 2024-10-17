import React, { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_HEIGHT } from '@/shared/constants';

import { Box } from '@leather.io/ui/native';

interface HeaderLayoutProps {
  leftElement?: ReactNode;
  centerElement?: ReactNode;
  rightElement?: ReactNode;
  bottomElement?: ReactNode;
}
export function HeaderLayout({
  leftElement,
  centerElement,
  rightElement,
  bottomElement,
}: HeaderLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <Box
      bg="ink.background-primary"
      style={{
        justifyContent: 'center',
        paddingTop: insets.top,
        width: '100%',
      }}
    >
      <Box
        alignItems="center"
        flexDirection="row"
        height={HEADER_HEIGHT}
        justifyContent="space-between"
        gap="2"
        py="3"
        px="3"
      >
        <Box
          alignItems="flex-start"
          flexGrow={1}
          height="100%"
          justifyContent="center"
          zIndex={100}
        >
          {leftElement}
        </Box>
        <Box
          alignItems="center"
          bottom={0}
          justifyContent="center"
          left={0}
          position="absolute"
          right={0}
          top={0}
        >
          {centerElement}
        </Box>
        <Box alignItems="flex-end" flexGrow={1} height="100%" justifyContent="center" zIndex={100}>
          {rightElement}
        </Box>
      </Box>
      {bottomElement}
    </Box>
  );
}
