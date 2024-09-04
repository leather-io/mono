import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HasChildren } from '@/utils/types';
import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

export default function NetworksScreenLayout({ children }: HasChildren) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Box backgroundColor="ink.background-primary" flex={1}>
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing[5],
          paddingBottom: theme.spacing['5'] + bottom,
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['5'],
        }}
      >
        {children}
      </ScrollView>
    </Box>
  );
}
