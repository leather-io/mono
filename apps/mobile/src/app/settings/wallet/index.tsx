import { useRef } from 'react';

import { AddWalletSheet } from '@/components/add-wallet/';
import { Divider } from '@/components/divider';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { NetworkBadge } from '@/features/settings/network-badge';
import { EmptyWalletsScreen } from '@/features/settings/wallet-and-accounts/components/empty-wallets-screen';
import { WalletsList } from '@/features/settings/wallet-and-accounts/wallets-list';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Eye1ClosedIcon, PlusIcon, SheetRef } from '@leather.io/ui/native';

export default function SettingsWalletScreen() {
  const router = useRouter();
  const addWalletSheetRef = useRef<SheetRef>(null);
  const hiddenAccounts = useAccounts('hidden');
  const hiddenAccountsLength = hiddenAccounts.list.length;
  const { list: walletsList } = useWallets();
  const hasWallets = walletsList.length > 0;
  return (
    <>
      <AnimatedHeaderScreenLayout
        rightHeaderElement={<NetworkBadge />}
        title={t({
          id: 'wallets.header_title',
          message: 'Wallets',
        })}
      >
        {hasWallets ? (
          <>
            <WalletsList variant="active" />
            <Divider />
            <SettingsList paddingTop="3">
              {hiddenAccountsLength > 0 && (
                <SettingsListItem
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
                  testID={TestId.walletSettingsHiddenAccountsButton}
                />
              )}
              <SettingsListItem
                title={t({
                  id: 'wallet.add_wallet.cell_title',
                  message: 'Add wallet',
                })}
                icon={<PlusIcon />}
                onPress={() => {
                  addWalletSheetRef.current?.present();
                }}
              />
            </SettingsList>
          </>
        ) : (
          <EmptyWalletsScreen
            onPressCreateWallet={() => {
              addWalletSheetRef.current?.present();
            }}
          />
        )}
      </AnimatedHeaderScreenLayout>
      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
    </>
  );
}
