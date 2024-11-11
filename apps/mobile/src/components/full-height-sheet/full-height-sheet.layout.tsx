import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HasChildren } from '@/utils/types';
import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

interface FullHeightSheetLayoutProps extends HasChildren {
  header: React.ReactNode;
}
export function FullHeightSheetLayout({ children, header }: FullHeightSheetLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <>
      <Box paddingTop="4">{header}</Box>
      <Box
        flex={1}
        style={{
          paddingBottom: theme.spacing[5] + bottom,
          paddingHorizontal: theme.spacing[5],
          paddingTop: theme.spacing[4],
        }}
      >
        {children}
      </Box>
    </>
  );
}
