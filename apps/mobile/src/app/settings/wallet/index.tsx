import { Divider } from '@/components/divider';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { PortfolioHeader } from '@/features/account/components/portfolio-header';
import SettingsLayout from '@/features/settings/settings-layout';
import { EmptyWalletsScreen } from '@/features/settings/wallet-and-accounts/components/empty-wallets-screen';
import { WalletsList } from '@/features/settings/wallet-and-accounts/wallets-list';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { plural, t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { Box, Eye1ClosedIcon, PlusIcon } from '@leather.io/ui/native';

export default function SettingsWalletScreen() {
  const router = useRouter();
  const { addWalletSheetRef } = useGlobalSheets();
  const hiddenAccounts = useAccounts('hidden');
  const hiddenAccountsLength = hiddenAccounts.list.length;
  const { list: walletsList } = useWallets();
  const hasWallets = walletsList.length > 0;

  return (
    <SettingsLayout title={t`Wallets`}>
      <Box px="5" pb="3">
        <PortfolioHeader />
      </Box>
      {hasWallets ? (
        <>
          <WalletsList variant="active" />
          <Divider my="3" />
          <SettingsList>
            {hiddenAccountsLength > 0 && (
              <SettingsListItem
                title={t`Hidden accounts`}
                caption={t({
                  message: plural(hiddenAccountsLength, {
                    one: '# hidden account',
                    other: '# hidden accounts',
                  }),
                })}
                icon={<Eye1ClosedIcon />}
                onPress={() => {
                  router.navigate('/settings/wallet/hidden-accounts');
                }}
              />
            )}
            <SettingsListItem
              title={t`Add wallet`}
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
    </SettingsLayout>
  );
}
