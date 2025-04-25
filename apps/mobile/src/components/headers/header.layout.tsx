import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_HEIGHT } from '@/shared/constants';

import { Box } from '@leather.io/ui/native';

interface HeaderLayoutProps {
  leftElement?: ReactNode;
  centerElement?: ReactNode;
  rightElement?: ReactNode;
  bottomElement?: ReactNode;
  error?: ReactNode;
}
export function HeaderLayout({
  leftElement,
  centerElement,
  rightElement,
  bottomElement,
  error,
}: HeaderLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      bg="ink.background-primary"
      justifyContent="center"
      width="100%"
      style={{ paddingTop: insets.top }}
    >
      {error}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        height={HEADER_HEIGHT}
        gap="2"
        py="3"
        px="3"
      >
        <Box alignItems="flex-start" justifyContent="center" flexGrow={1} height="100%" zIndex="20">
          {leftElement}
        </Box>
        <Box
          alignItems="center"
          justifyContent="center"
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
        >
          {centerElement}
        </Box>
        <Box alignItems="flex-end" flexGrow={1} height="100%" justifyContent="center" zIndex="20">
          {rightElement}
        </Box>
      </Box>
      {bottomElement}
    </Box>
  );
}
