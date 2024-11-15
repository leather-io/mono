import { useRef } from 'react';

import { AvatarIcon } from '@/components/avatar-icon';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { useToastContext } from '@/components/toast/toast-context';
import { NetworkBadge } from '@/features/settings/network-badge';
import { AccountCard } from '@/features/settings/wallet-and-accounts/account-card';
import { AccountNameSheet } from '@/features/settings/wallet-and-accounts/account-name-sheet';
import { AccountId } from '@/models/domain.model';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { Account, AccountLoader } from '@/store/accounts/accounts';
import { userRenamesAccount, userTogglesHideAccount } from '@/store/accounts/accounts.write';
import { makeAccountIdentifer, useAppDispatch } from '@/store/utils';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';

import {
  Box,
  Cell,
  Eye1ClosedIcon,
  HeadIcon,
  PassportIcon,
  SheetRef,
  Theme,
} from '@leather.io/ui/native';

interface ConfigureAccountProps extends AccountId {
  account: Account;
}
function ConfigureAccount({ fingerprint, accountIndex, account }: ConfigureAccountProps) {
  const accountNameSheetRef = useRef<SheetRef>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme<Theme>();
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
      <AnimatedHeaderScreenLayout
        rightHeaderElement={<NetworkBadge />}
        title={t({
          id: 'account.header_title',
          message: 'Configure account',
        })}
      >
        <Box pb="3">
          <AccountCard
            icon={<AvatarIcon color={theme.colors['ink.background-primary']} icon={account.icon} />}
            name={account.name}
            key={account.id}
            iconTestID={defaultIconTestId(account.icon)}
          />
        </Box>
        <Cell.Root
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
        >
          <Cell.Chevron />
        </Cell.Root>
        <Cell.Root
          title={t({
            id: 'configure_account.avatar.cell_title',
            message: 'Avatar',
          })}
          icon={<HeadIcon />}
          onPress={() => {
            router.navigate({
              pathname: AppRoutes.SettingsWalletConfigureAccountAvatar,
              params: { wallet: fingerprint, account: accountIndex },
            });
          }}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Cell.Root
          title={t({
            id: 'configure_account.hide_account.cell_title',
            message: 'Hide account',
          })}
          icon={<Eye1ClosedIcon />}
          onPress={toggleHideAccount}
        >
          <Cell.Switch value={account.status === 'hidden'} onValueChange={toggleHideAccount} />
        </Cell.Root>
      </AnimatedHeaderScreenLayout>
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
