import { useRef } from 'react';

import { AddWalletSheet } from '@/components/add-wallet/';
import { getAvatarIcon } from '@/components/avatar-icon';
import { AccountSelectorSheet } from '@/features/account-selector-sheet';
import { getMockAccounts } from '@/mocks/account.mocks';
import { AppRoutes } from '@/routes';
import { AccountStore } from '@/store/accounts/accounts.write';
import { WalletStore } from '@/store/wallets/wallets.write';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Box, SheetRef } from '@leather.io/ui/native';

import { Balance } from '../../balance/balance';
import { Widget, WidgetHeader } from '../components/widget';
import { AccountCard } from './components/cards/account-card';
import { AddAccountCard } from './components/cards/add-account-card';
import { CreateWalletCard } from './components/cards/create-wallet-card';
import { AddAccountSheet } from './sheets/add-account-sheet';

interface AccountsWidgetProps {
  accounts: AccountStore[];
  wallets: WalletStore[];
}

export function AccountsWidget({ accounts, wallets }: AccountsWidgetProps) {
  const sheetRef = useRef<SheetRef>(null);
  const addAccountSheetRef = useRef<SheetRef>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);

  const router = useRouter();

  const hasWallets = wallets.length > 0;
  const hasAccounts = accounts.length > 0;

  const { accounts: mockAccounts, balance } = getMockAccounts(accounts);

  return (
    <>
      <Widget
        scrollDirection="horizontal"
        header={
          <Box marginHorizontal="5">
            <WidgetHeader
              title={t`My accounts`}
              sheetRef={sheetRef}
              sheet={<AccountSelectorSheet sheetRef={sheetRef} />}
            />
            {hasWallets && <Balance balance={balance} variant="heading03" />}
          </Box>
        }
      >
        {mockAccounts.map(account => (
          <AccountCard
            type={account.type}
            Icon={getAvatarIcon(account.icon)}
            key={account.id}
            label={<Balance balance={account.balance} />}
            caption={account.name || ''}
            onPress={() => {
              router.navigate({
                pathname: AppRoutes.Account,
                params: {
                  fingerprint: account.fingerprint,
                  account: account.accountIndex,
                },
              });
            }}
          />
        ))}

        {hasAccounts ? (
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
