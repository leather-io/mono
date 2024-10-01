import { ScrollView } from 'react-native-gesture-handler';

import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

interface WidgetProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  scrollDirection?: 'vertical' | 'horizontal';
}

export function Widget({ children, header, scrollDirection = 'vertical' }: WidgetProps) {
  const theme = useTheme<Theme>();
  return (
    <Box paddingVertical="5" flexDirection="column" gap="3">
      <Box>{header}</Box>
      <ScrollView
        horizontal={scrollDirection === 'horizontal'}
        showsHorizontalScrollIndicator={scrollDirection === 'horizontal' ? false : undefined}
        contentContainerStyle={{ gap: theme.spacing['3'], paddingHorizontal: theme.spacing['5'] }}
      >
        {children}
      </ScrollView>
    </Box>
  );
}

// refactor to remove Pressable , fix balance display(reverse for Fiat) + line break
// check if I broke add account
