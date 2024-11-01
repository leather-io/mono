import { useRef } from 'react';

import { AddWalletSheet } from '@/components/add-wallet/';
import { AccountSelectorSheet } from '@/features/account-selector-sheet';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { AppRoutes } from '@/routes';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Box, SheetRef } from '@leather.io/ui/native';

import { Balance } from '../../balance/balance';
import { Widget, WidgetHeader } from '../components/widget';
import { AccountCard } from './components/cards/account-card';
import { AddAccountCard } from './components/cards/add-account-card';
import { CreateWalletCard } from './components/cards/create-wallet-card';
import { AddAccountSheet } from './sheets/add-account-sheet';

export function AccountsWidget() {
  const sheetRef = useRef<SheetRef>(null);
  const addAccountSheetRef = useRef<SheetRef>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);
  const router = useRouter();
  const wallets = useWallets();
  const accounts = useAccounts();

  const { totalBalance } = useTotalBalance();

  return (
    <>
      <Widget
        scrollDirection="horizontal"
        header={
          <Box marginHorizontal="5">
            <WidgetHeader
              title={t({
                id: 'accounts.header_title',
                message: 'My accounts',
              })}
              sheetRef={sheetRef}
              sheet={<AccountSelectorSheet sheetRef={sheetRef} />}
            />
            {wallets.hasWallets && <Balance balance={totalBalance} variant="heading03" />}
          </Box>
        }
      >
        {accounts.list.map(account => (
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
      </Widget>

      <AddAccountSheet addAccountSheetRef={addAccountSheetRef} />
      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
    </>
  );
}
