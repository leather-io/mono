import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WalletsList } from '@/components/wallet-settings/wallets-list';
import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

export default function HiddenAccountsScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Box px="5">
          <WalletsList variant="hidden" />
        </Box>
      </ScrollView>
    </Box>
  );
}
