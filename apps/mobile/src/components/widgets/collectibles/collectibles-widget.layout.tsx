import { ScrollView } from 'react-native-gesture-handler';

import { useTheme } from '@shopify/restyle';

import { Box, SheetRef, Theme } from '@leather.io/ui/native';

import { Widget } from '../widget';

interface CollectiblesWidgetLayoutProps {
  balance?: React.ReactNode;
  children: React.ReactNode;
  header?: React.ReactNode;
  sheetRef?: React.RefObject<SheetRef>;
}

export function CollectiblesWidgetLayout({ children, header }: CollectiblesWidgetLayoutProps) {
  const theme = useTheme<Theme>();
  return (
    <Widget>
      <Box>{header}</Box>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{ gap: theme.spacing['3'], marginHorizontal: theme.spacing['5'] }}
      >
        {children}
      </ScrollView>
    </Widget>
  );
}
