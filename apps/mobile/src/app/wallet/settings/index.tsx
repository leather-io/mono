import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Text, Theme } from '@leather.io/ui/native';

export default function SettingsScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['3'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Text>{t`Hello`}</Text>
      </ScrollView>
    </Box>
  );
}
