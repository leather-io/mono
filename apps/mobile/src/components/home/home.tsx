import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

import { HEADER_HEIGHT } from '../blurred-header';
import { Earn } from './earn';
import { MyAccounts } from './my-accounts';

export function Home() {
  const { top, bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const contentOffsetTop = top + HEADER_HEIGHT;
  return (
    <Box
      flex={1}
      backgroundColor="base.ink.background-primary"
      style={{ paddingTop: contentOffsetTop }}
    >
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
