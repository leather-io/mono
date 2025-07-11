import { useRef } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useToastContext } from '@/components/toast/toast-context';
import { AccountAddress } from '@/features/account/components/account-address';
import { AccountCard } from '@/features/account/components/account-card';
import { AccountBalance } from '@/features/balances/total-balance';
import SettingsLayout from '@/features/settings/settings-layout';
import { AccountNameSheet } from '@/features/settings/wallet-and-accounts/account-name-sheet';
import { TestId } from '@/shared/test-id';
import { Account, AccountLoader } from '@/store/accounts/accounts';
import { userRenamesAccount, userTogglesHideAccount } from '@/store/accounts/accounts.write';
import { makeAccountIdentifer, useAppDispatch } from '@/store/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';

import { AccountId } from '@leather.io/models';
import {
  Box,
  Eye1ClosedIcon,
  Eye1Icon,
  HeadIcon,
  PassportIcon,
  SheetRef,
} from '@leather.io/ui/native';

interface ConfigureAccountProps extends AccountId {
  account: Account;
}
function ConfigureAccount({ fingerprint, accountIndex, account }: ConfigureAccountProps) {
  const accountNameSheetRef = useRef<SheetRef>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { i18n } = useLingui();

  const { displayToast } = useToastContext();

  function setName(name: string) {
    if (name === '') {
      displayToast({
        title: t({
          id: 'configure_account.account_name.empty_name_error',
          message: 'Account name cannot be empty',
        }),
        type: 'error',
      });
      return { success: false };
    }
    dispatch(
      userRenamesAccount({
        accountId: makeAccountIdentifer(fingerprint, accountIndex),
        name,
      })
    );
    return { success: true };
  }

  function toggleHideAccount() {
    dispatch(userTogglesHideAccount({ accountId: account.id }));
  }

  return (
    <>
      <SettingsLayout
        title={t({
          id: 'configure_account.header_title',
          message: 'Configure account',
        })}
      >
        <Box gap="4">
          <Box px="5">
            <WalletLoader fingerprint={account.fingerprint} key={account.id}>
              {wallet => (
                <AccountCard
                  address={<AccountAddress fingerprint={fingerprint} accountIndex={accountIndex} />}
                  secondaryTitle={
                    <AccountBalance
                      fingerprint={fingerprint}
                      accountIndex={accountIndex}
                      variant="label01"
                    />
                  }
                  icon={account.icon}
                  iconTestID={defaultIconTestId(account.icon)}
                  primaryTitle={account.name}
                  caption={wallet.name}
                  onPress={() => {
                    router.navigate({
                      pathname: '/account/[accountId]',
                      params: { accountId: account.id },
                    });
                  }}
                />
              )}
            </WalletLoader>
          </Box>
          <SettingsList gap="1">
            <SettingsListItem
              title={t({
                id: 'configure_account.name.cell_title',
                message: 'Name',
              })}
              caption={i18n._({
                id: 'configure_account.name.cell_caption',
                message: '{name}',
                values: { name: account.name },
              })}
              icon={<PassportIcon />}
              onPress={() => {
                accountNameSheetRef.current?.present();
              }}
              testID={TestId.walletSettingsAccountNameCell}
            />
            <SettingsListItem
              title={t({
                id: 'configure_account.avatar.cell_title',
                message: 'Avatar',
              })}
              icon={<HeadIcon />}
              onPress={() => {
                router.navigate({
                  pathname: '/settings/wallet/configure/[wallet]/[account]/choose-avatar',
                  params: { wallet: fingerprint, account: accountIndex },
                });
              }}
            />
            {account.status === 'active' ? (
              <SettingsListItem
                title={t({
                  id: 'configure_account.hide_account.cell_title',
                  message: 'Hide account',
                })}
                icon={<Eye1ClosedIcon />}
                onPress={toggleHideAccount}
              />
            ) : (
              <SettingsListItem
                title={t({
                  id: 'configure_account.unhide_account.cell_title',
                  message: 'Reveal account',
                })}
                icon={<Eye1Icon />}
                onPress={toggleHideAccount}
              />
            )}
          </SettingsList>
        </Box>
      </SettingsLayout>
      <AccountNameSheet name={account.name} setName={setName} sheetRef={accountNameSheetRef} />
    </>
  );
}

const configureAccountParamsSchema = z.object({
  fingerprint: z.string(),
  account: z.string().transform(value => Number(value)),
});

export default function ConfigureAccountScreen() {
  const params = useLocalSearchParams();
  const { fingerprint, account: accountIndex } = configureAccountParamsSchema.parse(params);

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => (
        <ConfigureAccount fingerprint={fingerprint} accountIndex={accountIndex} account={account} />
      )}
    </AccountLoader>
  );
}
