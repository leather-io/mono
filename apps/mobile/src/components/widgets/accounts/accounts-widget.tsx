import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletSheet } from '@/components/add-wallet/';
import { getAvatarIcon } from '@/components/avatar-icon';
import { BackButtonHeader } from '@/components/headers/back-button';
import { SimpleHeader } from '@/components/headers/containers/simple-header';
import { AccountSelectorSheet } from '@/features/account-selector-sheet';
import { AppRoutes } from '@/routes';
import { AccountStore } from '@/store/accounts/accounts.write';
import { WalletStore } from '@/store/wallets/wallets.write';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { Box, SheetRef } from '@leather.io/ui/native';

import { FiatBalance } from '../components/balance/fiat-balance';
import { Widget, WidgetHeader } from '../components/widget';
import { AccountCard } from './cards/account-card';
import { AccountOverview } from './cards/account-overview-card';
import { CreateWalletCard } from './cards/create-wallet-card';
import { ImportWalletCard } from './cards/import-wallet-card';

interface MockedAccount extends AccountStore {
  type: WalletStore['type'];
  balance: number;
}

interface AccountsWidgetProps {
  accounts: AccountStore[];
  wallets: WalletStore[];
}

export function AccountsWidget({ accounts, wallets }: AccountsWidgetProps) {
  const sheetRef = useRef<SheetRef>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);
  const [selectedAccount, setSelectedAccount] = useState<MockedAccount | null>(null);
  const insets = useSafeAreaInsets();

  const router = useRouter();

  const hasWallets = wallets.length > 0;
  const hasAccounts = accounts.length > 0;

  // FIXME: this is fake data for now
  // need to implement fetch of account?.type + balances
  const mockedAccounts = accounts.map((account, index) => {
    return {
      ...account,
      type: 'software',
      balance: index + 10,
    };
  });

  const mockedWalletBalance = mockedAccounts.reduce((sum, account) => sum + account.balance, 0);

  if (selectedAccount) {
    return (
      <>
        {/* FIXME: This is throwaway code to add a fake header 
      - work needs to be done to update the  wallet/_layout header when account selected
      - I tried passing navigation params but didn't figure it out yet
       
       - I think I will need to add a new Stack.Screen for this that also has the same asset widget below
       */}
        <SimpleHeader
          insets={insets}
          left={<BackButtonHeader onPress={() => setSelectedAccount(null)} />}
        />
        <AccountOverview
          Icon={getAvatarIcon(selectedAccount.icon)}
          heading={<FiatBalance balance={selectedAccount.balance} variant="heading02" />}
          caption={selectedAccount.name}
        />
      </>
    );
  }
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
            {hasWallets && <FiatBalance balance={mockedWalletBalance} variant="heading03" />}
          </Box>
        }
      >
        {mockedAccounts.map(account => (
          <AccountCard
            type={account.type as WalletStore['type']}
            Icon={getAvatarIcon(account.icon)}
            key={account.id}
            label={<FiatBalance balance={account.balance} />}
            caption={account.name || ''}
            onPress={() => setSelectedAccount(account as MockedAccount)}
          />
        ))}

        {hasAccounts ? (
          <ImportWalletCard onPress={() => router.navigate(AppRoutes.RecoverWallet)} />
        ) : (
          <CreateWalletCard onPress={() => addWalletSheetRef.current?.present()} />
        )}
      </Widget>

      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
    </>
  );
}
