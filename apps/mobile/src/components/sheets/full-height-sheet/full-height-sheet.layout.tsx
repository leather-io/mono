import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/screen/screen';

import { Box, HasChildren, useTheme } from '@leather.io/ui/native';

interface FullHeightSheetLayoutProps extends HasChildren {
  header: React.ReactNode;
}
export function FullHeightSheetLayout({ children, header }: FullHeightSheetLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <Screen>
      <Box paddingTop="4">{header}</Box>
      <Box
        flex={1}
        style={{
          paddingBottom: Math.max(theme.spacing[7], bottom),
          paddingTop: theme.spacing[4],
        }}
      >
        {children}
      </Box>
    </Screen>
  );
}
