import { useRef } from 'react';

import { AddWalletSheet } from '@/components/add-wallet/';
import { AccountSelectorSheet } from '@/features/account-selector-sheet';
import { useTotalBalance } from '@/hooks/balances/use-total-balance';
import { getMockAccounts } from '@/mocks/account.mocks';
import { MockedAccount } from '@/mocks/account.mocks';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
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
  accounts: MockedAccount[];
  wallets: WalletStore[];
}

export function AccountsWidget({ accounts, wallets }: AccountsWidgetProps) {
  const sheetRef = useRef<SheetRef>(null);
  const addAccountSheetRef = useRef<SheetRef>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);
  const router = useRouter();

  const hasWallets = wallets.length > 0;
  const hasAccounts = accounts.length > 0;

  if (!hasAccounts) return null;
  const totalBalance = useTotalBalance(accounts);

  const { accounts: mockAccounts } = getMockAccounts(accounts);

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
            {hasWallets && <Balance balance={totalBalance} variant="heading03" />}
          </Box>
        }
      >
        {/* TODO stop using mock accounts and use the real ones 
          Do we need to create a different selector here?
          Should I add fingerprint and account index to the AccountStore type??
        */}
        {mockAccounts.map(account => (
          <AccountCard
            account={account}
            key={account.id}
            testID={TestId.homeAccountCard}
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
