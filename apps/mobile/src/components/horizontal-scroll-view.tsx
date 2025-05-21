import { ScrollView } from 'react-native-gesture-handler';

import { useTheme } from '@shopify/restyle';

import { HasChildren, Theme } from '@leather.io/ui/native';

export function HorizontalScrollView({ children }: HasChildren) {
  const theme = useTheme<Theme>();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: theme.spacing['2'],
        paddingHorizontal: theme.spacing['5'],
      }}
      style={{
        // prevent card shadows being cut off
        overflow: 'visible',
      }}
    >
      {children}
    </ScrollView>
  );
}
