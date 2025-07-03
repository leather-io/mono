import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import { FetchErrorCallout } from '@/components/error/fetch-error';
import { Widget } from '@/components/widget';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { AccountCard } from '@/features/account/components/account-card';
import { AccountBalance, TotalBalance } from '@/features/balances/total-balance';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
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

export function AccountsWidget() {
  const accountSelectorSheetRef = useRef<SheetRef>(null);
  const router = useRouter();
  const wallets = useWallets();
  const accounts = useAccounts();
  const { totalBalance } = useTotalBalance();
  const { i18n } = useLingui();
  const theme = useTheme<Theme>();
  const { addAccountSheetRef, addWalletSheetRef } = useGlobalSheets();

  throw new Error('Please catch me with ErrorUtils.setGlobalHandler');

  const isLoadingTotalBalance = totalBalance.state === 'loading';
  const isErrorTotalBalance = totalBalance.state === 'error';
  return (
    <>
      {isErrorTotalBalance && <FetchErrorCallout />}
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
                <TotalBalance variant="heading03" />
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
                      pathname: '/account/[accountId]',
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

      <AccountSelectorSheet
        sheetRef={accountSelectorSheetRef}
        onAccountPress={(accountId: string) => {
          accountSelectorSheetRef.current?.close();
          router.navigate({
            pathname: '/account/[accountId]',
            params: { account: accountId, accountId },
          });
        }}
      />
    </>
  );
}
