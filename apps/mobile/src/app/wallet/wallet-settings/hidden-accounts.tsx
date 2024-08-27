import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WalletsList } from '@/components/wallet-settings/wallets-list';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, Theme } from '@leather.io/ui/native';

export default function HiddenAccountsScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <Sheet
        contentContainerStyle={{
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Box px="5">
          <WalletsList variant="hidden" />
        </Box>
      </Sheet>
    </Box>
  );
}
