import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_HEIGHT } from '@/shared/constants';

import { Box } from '@leather.io/ui/native';

export interface HeaderLayoutProps {
  leftElement?: ReactNode;
  centerElement?: ReactNode;
  rightElement?: ReactNode;
  bottomElement?: ReactNode;
  topElement?: ReactNode;
}
export function HeaderLayout({
  leftElement,
  centerElement,
  rightElement,
  bottomElement,
  topElement,
}: HeaderLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      justifyContent="center"
      width="100%"
      bg="ink.background-primary"
      style={{ paddingTop: insets.top }}
    >
      {topElement}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="2"
        height={HEADER_HEIGHT}
        px="4"
      >
        <Box alignItems="flex-start" flexGrow={1} zIndex="20">
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
        <Box zIndex="20">{rightElement}</Box>
      </Box>
      {bottomElement}
    </Box>
  );
}
