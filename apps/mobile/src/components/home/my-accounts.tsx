import { ScrollView } from 'react-native-gesture-handler';

import { APP_ROUTES } from '@/constants';
import { useWallets } from '@/state/wallets/wallets.slice';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, ChevronRightIcon, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { AccountCard } from './account-card';

export function MyAccounts() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const wallets = useWallets();
  if (wallets.list.length === 0) {
    return null;
  }

  const accountComponents = wallets.list.map(wallet => (
    <AccountCard
      key={wallet.fingerprint}
      fingerprint={wallet.fingerprint}
      type={wallet.type}
      onPress={() => router.push(APP_ROUTES.WalletAllAssets)}
    />
  ));

  return (
    <Box style={{ marginBottom: 40 }}>
      <Box flexDirection="column" paddingBottom="3">
        <TouchableOpacity flexDirection="row" gap="1" alignItems="center">
          <Text variant="heading05">{t`My accounts`}</Text>
          <ChevronRightIcon variant="small" />
        </TouchableOpacity>
        <Text variant="caption01">$0</Text>
      </Box>
      <ScrollView horizontal contentContainerStyle={{ gap: theme.spacing['2'] }}>
        {accountComponents}
      </ScrollView>
    </Box>
  );
}
