import { useRef } from 'react';

import { AddWalletSheet } from '@/components/add-wallet/';
import { Divider } from '@/components/divider';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { NetworkBadge } from '@/components/network-badge';
import { WalletsList } from '@/features/settings/wallet-and-accounts/wallets-list';
import { AppRoutes } from '@/routes';
import { useAccounts } from '@/store/accounts/accounts.read';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Box, Cell, Eye1ClosedIcon, PlusIcon, SheetRef } from '@leather.io/ui/native';

export default function SettingsWalletScreen() {
  const router = useRouter();
  const addWalletSheetRef = useRef<SheetRef>(null);
  const hiddenAccounts = useAccounts('hidden');
  const hiddenAccountsLength = hiddenAccounts.list.length;
  return (
    <>
      <AnimatedHeaderScreenLayout
        rightHeaderElement={<NetworkBadge />}
        title={t({
          id: 'wallets.header_title',
          message: 'Wallets',
        })}
      >
        <WalletsList variant="active" />
        <Divider />
        <Box gap="3" paddingTop="3">
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
      </AnimatedHeaderScreenLayout>
      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
    </>
  );
}
