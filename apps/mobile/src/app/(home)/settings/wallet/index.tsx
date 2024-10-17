import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletSheet } from '@/components/add-wallet/';
import { Divider } from '@/components/divider';
import { WalletsList } from '@/components/wallet-settings/wallets-list';
import { AppRoutes } from '@/routes';
import { useAccounts } from '@/store/accounts/accounts.read';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, Cell, Eye1ClosedIcon, PlusIcon, SheetRef, Theme } from '@leather.io/ui/native';

export default function SettingsWalletScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();
  const addWalletSheetRef = useRef<SheetRef>(null);
  const hiddenAccounts = useAccounts('hidden');
  const hiddenAccountsLength = hiddenAccounts.list.length;
  return (
    <>
      <Box flex={1} backgroundColor="ink.background-primary">
        <ScrollView
          contentContainerStyle={{
            paddingTop: theme.spacing['5'],
            paddingBottom: theme.spacing['5'] + bottom,
            gap: theme.spacing[5],
          }}
        >
          <Box px="5">
            <WalletsList variant="active" />
          </Box>
          <Box>
            <Divider />
            <Box p="5" gap="6">
              <Cell.Root
                title={t({
                  id: 'wallet.hidden_accounts.cell_title',
                  message: 'Hidden accounts',
                })}
                caption={t({
                  id: 'wallet.hidden_accounts.cell_caption',
                  message: `${hiddenAccountsLength} hidden accounts`,
                })}
                icon={<Eye1ClosedIcon />}
                onPress={() => {
                  router.navigate(AppRoutes.SettingsWalletHiddenAccounts);
                }}
              >
                <Cell.Chevron />
              </Cell.Root>
              <Cell.Root
                title={t({
                  id: 'wallet.add_wallet.cell_title',
                  message: 'Add wallet',
                })}
                icon={<PlusIcon />}
                onPress={() => {
                  addWalletSheetRef.current?.present();
                }}
              >
                <Cell.Chevron />
              </Cell.Root>
            </Box>
          </Box>
        </ScrollView>
      </Box>
      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
    </>
  );
}
