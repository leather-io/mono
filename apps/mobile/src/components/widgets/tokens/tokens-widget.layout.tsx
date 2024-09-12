import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { useTheme } from '@shopify/restyle';

import { Box, SheetRef, Theme } from '@leather.io/ui/native';

import { Widget } from '../widget';

interface TokensWidgetLayoutProps {
  balance?: React.ReactNode;
  children: React.ReactNode;
  header?: React.ReactNode;
  sheetRef?: React.RefObject<SheetRef>;
}

export function TokensWidgetLayout({ children, header }: TokensWidgetLayoutProps) {
  const theme = useTheme<Theme>();
  return (
    <Widget>
      <Box>{header}</Box>
      <ScrollView
        contentContainerStyle={{ gap: theme.spacing['3'], marginHorizontal: theme.spacing['5'] }}
      >
        {children}
      </ScrollView>
    </Widget>
  );
}
