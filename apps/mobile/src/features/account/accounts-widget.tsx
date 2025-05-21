import { useRef } from 'react';

import { HorizontalScrollView } from '@/components/horizontal-scroll-view';
import { FetchError } from '@/components/loading/error';
import { Widget } from '@/components/widget';
import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { AccountCard } from '@/features/account/components/account-card';
import { AccountBalance, TotalBalance } from '@/features/balances/total-balance';
import { AddWalletSheet } from '@/features/wallet-manager/add-wallet/add-wallet-sheet';
import { useTotalBalance } from '@/queries/balance/total-balance.query';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useAccounts } from '@/store/accounts/accounts.read';
import { useWallets } from '@/store/wallets/wallets.read';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { useRouter } from 'expo-router';

import { Box, SheetRef, SkeletonLoader, Theme } from '@leather.io/ui/native';

import { AddAccountCard } from './components/add-account-card';
import { CreateWalletCard } from './components/create-wallet-card';
import { AddAccountSheet } from './sheets/add-account-sheet';

export function AccountsWidget() {
  const accountSelectorSheetRef = useRef<SheetRef>(null);
  const addAccountSheetRef = useRef<SheetRef>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);
  const router = useRouter();
  const wallets = useWallets();
  const accounts = useAccounts();
  const { totalBalance } = useTotalBalance();
  const { i18n } = useLingui();

  const isLoadingTotalBalance = totalBalance.state === 'loading';
  const isErrorTotalBalance = totalBalance.state === 'error';
  return (
    <>
      {isErrorTotalBalance && <FetchError />}
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
          <HorizontalScrollView>
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
          </HorizontalScrollView>
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
