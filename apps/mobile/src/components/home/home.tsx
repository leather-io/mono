import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

import { Earn } from './earn';
import { MyAccounts } from './my-accounts';

export function Home() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  return (
    <Box flex={1} bg="base.ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[3],
        }}
      >
        <MyAccounts />
        <Box style={{ marginBottom: 40 }} />
        <Earn />
      </ScrollView>
    </Box>
  );
}
