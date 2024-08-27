import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletModal } from '@/components/add-wallet/add-wallet-modal';
import { Cell } from '@/components/cell';
import { Divider } from '@/components/divider';
import { WalletsList } from '@/components/wallet-settings/wallets-list';
import { APP_ROUTES } from '@/constants';
import { useAccounts } from '@/state/accounts/accounts.slice';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, Eye1ClosedIcon, PlusIcon, Sheet, Theme } from '@leather.io/ui/native';

export default function SettingsScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();
  const addWalletModalRef = useRef<BottomSheetModal>(null);
  const hiddenAccounts = useAccounts('hidden');
  const hiddenAccountsLength = hiddenAccounts.list.length;
  return (
    <>
      <Box justifyContent="space-between" flex={1} backgroundColor="ink.background-primary">
        <Sheet
          contentContainerStyle={{
            paddingTop: theme.spacing['5'],
            paddingBottom: theme.spacing['5'] + bottom,
            gap: theme.spacing[5],
          }}
        >
          <Box px="5">
            <WalletsList variant="active" />
          </Box>
        </Sheet>
        <Box>
          <Divider />
          <Box px="5" pt="5" style={{ paddingBottom: theme.spacing['5'] + bottom }} gap="6">
            <Cell
              title={t`Hidden accounts`}
              subtitle={t`${hiddenAccountsLength} hidden accounts`}
              Icon={Eye1ClosedIcon}
              onPress={() => {
                router.navigate(APP_ROUTES.WalletWalletsSettingsHiddenAccounts);
              }}
            />
            <Cell
              title={t`Add wallet`}
              Icon={PlusIcon}
              onPress={() => {
                addWalletModalRef.current?.present();
              }}
            />
          </Box>
        </Box>
      </Box>
      <AddWalletModal addWalletModalRef={addWalletModalRef} />
    </>
  );
}
