import { ScrollView } from 'react-native-gesture-handler';

import Chevron from '@/assets/chevron-right.svg';
import { APP_ROUTES } from '@/constants';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { TransText } from '../trans-text';
import { AccountCard } from './account-card';

export function MyAccounts() {
  const theme = useTheme<Theme>();
  const router = useRouter();

  return (
    <Box>
      <Box flexDirection="column" paddingBottom="3">
        <TouchableOpacity flexDirection="row" gap="1" alignItems="center">
          <TransText variant="heading05">My accounts</TransText>
          <Chevron width={16} height={16} />
        </TouchableOpacity>
        <TransText variant="caption01">$0</TransText>
      </Box>
      <ScrollView horizontal contentContainerStyle={{ gap: theme.spacing['2'] }}>
        <AccountCard onPress={() => router.push(APP_ROUTES.WalletAllAssets)} />
        <AccountCard onPress={() => router.push(APP_ROUTES.WalletAllAssets)} />
        <AccountCard onPress={() => router.push(APP_ROUTES.WalletAllAssets)} />
      </ScrollView>
    </Box>
  );
}
