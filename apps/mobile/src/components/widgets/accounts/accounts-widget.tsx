import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { AddWalletSheet } from '@/components/add-wallet/';
import { AccountSelectorSheet } from '@/features/accounts/account-selector/account-selector-sheet';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { AppRoutes } from '@/routes';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, SheetRef, Theme } from '@leather.io/ui/native';

import { Balance } from '../../balance/balance';
import { Widget } from '../components/widget';
import { AccountCard } from './components/cards/account-card';
import { AddAccountCard } from './components/cards/add-account-card';
import { CreateWalletCard } from './components/cards/create-wallet-card';
import { AddAccountSheet } from './sheets/add-account-sheet';

export function AccountsWidget() {
  const accountSelectorSheetRef = useRef<SheetRef>(null);
  const addAccountSheetRef = useRef<SheetRef>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);
  const router = useRouter();
  const wallets = useWallets();
  const accounts = useAccounts();
  const theme = useTheme<Theme>();

  const { totalBalance } = useTotalBalance();
  // TODO: handle balance loading & error states
  if (totalBalance.state !== 'success') return;

  return (
    <>
      <Widget>
        <Box>
          <Widget.Header
            onPress={
              wallets.hasWallets ? () => accountSelectorSheetRef.current?.present() : undefined
            }
          >
            <Widget.Title title={t({ id: 'accounts.header_title', message: 'My accounts' })} />
          </Widget.Header>
          {wallets.hasWallets && (
            <Box px="5">
              <Balance balance={totalBalance.value} variant="heading03" />
            </Box>
          )}
        </Box>
        <Widget.Body>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: theme.spacing['3'],
              paddingHorizontal: theme.spacing['5'],
            }}
          >
            {accounts.list
              .filter(account => account.status !== 'hidden')
              .map(account => (
                <AccountCard
                  account={account}
                  key={account.id}
                  onPress={() => {
                    router.navigate({
                      pathname: AppRoutes.Account,
                      params: {
                        accountId: account.id,
                      },
                    });
                  }}
                />
              ))}

            {accounts.hasAccounts ? (
              <AddAccountCard onPress={() => addAccountSheetRef.current?.present()} />
            ) : (
              <CreateWalletCard onPress={() => addWalletSheetRef.current?.present()} />
            )}
          </ScrollView>
        </Widget.Body>
      </Widget>

      <AddAccountSheet addAccountSheetRef={addAccountSheetRef} />
      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
      <AccountSelectorSheet sheetRef={accountSelectorSheetRef} />
    </>
  );
}
