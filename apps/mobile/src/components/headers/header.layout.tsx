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
        width: '100%',
        paddingTop: insets.top,
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
        <Box alignItems="flex-start" flex={1} height="100%" justifyContent="center">
          {leftElement}
        </Box>
        <Box alignItems="center" flex={2} height="100%" justifyContent="center">
          {centerElement}
        </Box>
        <Box alignItems="flex-end" flex={1} height="100%" justifyContent="center">
          {rightElement}
        </Box>
      </Box>
      {bottomElement}
    </Box>
  );
}
