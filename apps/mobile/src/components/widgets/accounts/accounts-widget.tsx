import { useRef } from 'react';

import { AddWalletSheet } from '@/components/add-wallet/';
import { AvatarIcon } from '@/components/avatar-icon';
import { AccountSelectorSheet } from '@/features/account-selector-sheet';
import { getMockAccounts } from '@/mocks/account.mocks';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { AccountStore } from '@/store/accounts/utils';
import { WalletStore } from '@/store/wallets/utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, SheetRef, Theme } from '@leather.io/ui/native';

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
  const { i18n } = useLingui();
  const router = useRouter();
  const theme = useTheme<Theme>();

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
              title={t({
                id: 'accounts.header_title',
                message: 'My accounts',
              })}
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
            icon={
              <AvatarIcon
                color={theme.colors['ink.background-primary']}
                icon={account.icon}
                width={32}
                height={32}
              />
            }
            key={account.id}
            label={<Balance balance={account.balance} />}
            caption={i18n._({
              id: 'accounts.account.cell_caption',
              message: '{name}',
              values: { name: account.name || '' },
            })}
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
