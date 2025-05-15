import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { Balance } from '@/components/balance/balance';
import { FetchError } from '@/components/loading/error';
import { Widget } from '@/components/widget';
import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { AccountBalance } from '@/features/account/components/account-balance';
import { AccountCard } from '@/features/account/components/account-card';
import { TokenBalance } from '@/features/balances/token-balance';
import { AddWalletSheet } from '@/features/wallet-manager/add-wallet/add-wallet-sheet';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, SheetRef, SkeletonLoader, Theme } from '@leather.io/ui/native';

import { AddAccountCard } from './components/add-account-card';
import { CreateWalletCard } from './components/create-wallet-card';
import { AddAccountSheet } from './sheets/add-account-sheet';

interface AccountsWidgetProps {
  totalBalance: TokenBalance;
  isLoadingTotalBalance: boolean;
  fetchError?: boolean;
}

export function AccountsWidget({
  totalBalance,
  isLoadingTotalBalance,
  fetchError,
}: AccountsWidgetProps) {
  const accountSelectorSheetRef = useRef<SheetRef>(null);
  const addAccountSheetRef = useRef<SheetRef>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);
  const router = useRouter();
  const wallets = useWallets();
  const accounts = useAccounts();
  const { i18n } = useLingui();
  const theme = useTheme<Theme>();

  return (
    <>
      {fetchError && <FetchError />}
      <Widget>
        <Box>
          <Widget.Header
            onPress={
              wallets.hasWallets ? () => accountSelectorSheetRef.current?.present() : undefined
            }
          >
            <Widget.Title title={t({ id: 'accounts.header_title', message: 'All accounts' })} />
          </Widget.Header>
          {wallets.hasWallets && (
            <Box px="5">
              {isLoadingTotalBalance ? (
                <SkeletonLoader height={44} width={132} isLoading={true} />
              ) : (
                <Balance balance={totalBalance} variant="heading03" />
              )}
            </Box>
          )}
        </Box>
        <Widget.Body>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: theme.spacing['2'],
              paddingHorizontal: theme.spacing['5'],
            }}
            style={{
              // prevent card shadows being cut off
              overflow: 'visible',
            }}
          >
            {accounts.list
              .filter(account => account.status !== 'hidden')
              .map((account, i) => (
                <AccountCard
                  width={200}
                  isLoading={isLoadingTotalBalance}
                  testID={`${TestId.homeAccountCard}-${i}`}
                  caption={i18n._({
                    id: 'accounts.account.cell_caption',
                    message: '{name}',
                    values: { name: account.name || '' },
                  })}
                  primaryTitle={
                    <AccountBalance
                      variant="label01"
                      accountIndex={account.accountIndex}
                      fingerprint={account.fingerprint}
                    />
                  }
                  icon={account.icon}
                  iconTestID={defaultIconTestId(account.icon)}
                  key={account.id}
                  onPress={() => {
                    router.navigate({
                      pathname: AppRoutes.Account,
                      params: {
                        account: account.id,
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
      <AccountSelectorSheet
        sheetRef={accountSelectorSheetRef}
        onAccountPress={(accountId: string) => {
          accountSelectorSheetRef.current?.close();
          router.navigate({
            pathname: AppRoutes.Account,
            params: { account: accountId, accountId },
          });
        }}
      />
    </>
  );
}
