import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { AccountSelectorSheet } from '@/features/account-selector-sheet';
import { APP_ROUTES } from '@/routes';
import { useAccounts } from '@/state/accounts/accounts.slice';
import { useWallets } from '@/state/wallets/wallets.slice';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, ChevronRightIcon, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

import { AccountCard } from './account-card';

export function MyAccounts() {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const wallets = useWallets();
  const accounts = useAccounts();
  const modalRef = useRef<BottomSheetModal>(null);

  if (wallets.list.length === 0) return null;

  const accountComponents = accounts.list.map(account => (
    <AccountCard
      type="software"
      key={account.id}
      fingerprint={account.id}
      onPress={() => router.push(APP_ROUTES.WalletAllAssets)}
    />
  ));

  return (
    <Box style={{ marginBottom: 40 }}>
      <Box px="5" flexDirection="column" paddingBottom="3">
        <TouchableOpacity
          onPress={() => modalRef.current?.present()}
          flexDirection="row"
          gap="1"
          alignItems="center"
        >
          <Text variant="heading05">{t`My accounts`}</Text>
          <ChevronRightIcon variant="small" />
        </TouchableOpacity>
        <Text variant="caption01">$0</Text>
      </Box>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{ gap: theme.spacing['2'], paddingHorizontal: theme.spacing['5'] }}
      >
        {accountComponents}
      </ScrollView>
      <AccountSelectorSheet modalRef={modalRef} />
    </Box>
  );
}
