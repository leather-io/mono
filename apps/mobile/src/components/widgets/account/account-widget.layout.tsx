import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { useTheme } from '@shopify/restyle';

import { Box, SheetRef, Theme } from '@leather.io/ui/native';

import { Widget } from '../widget';

interface AccountWidgetProps {
  balance?: React.ReactNode;
  children: React.ReactNode;
  header?: React.ReactNode;
  sheetRef?: React.RefObject<SheetRef>;
}

export function AccountWidgetLayout({ balance, children, header }: AccountWidgetProps) {
  const theme = useTheme<Theme>();
  return (
    <Widget>
      <Box marginHorizontal="5">
        {header}
        {balance}
      </Box>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{
          gap: theme.spacing['3'],
          marginHorizontal: theme.spacing['5'],
        }}
      >
        {children}
      </ScrollView>
    </Widget>
  );
}
