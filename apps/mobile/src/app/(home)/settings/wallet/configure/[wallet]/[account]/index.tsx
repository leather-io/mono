import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAvatarIcon } from '@/components/avatar-icon';
import { useToastContext } from '@/components/toast/toast-context';
import { AccountCard } from '@/components/wallet-settings/account-card';
import { AccountNameSheet } from '@/components/wallet-settings/account-name-sheet';
import { AccountId } from '@/models/domain.model';
import { AppRoutes } from '@/routes';
import { Account, AccountLoader } from '@/store/accounts/accounts';
import { userRenamesAccount, userTogglesHideAccount } from '@/store/accounts/accounts.write';
import { makeAccountIdentifer, useAppDispatch } from '@/store/utils';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const accountNameSheetRef = useRef<SheetRef>(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const router = useRouter();
  const { i18n } = useLingui();

  const { displayToast } = useToastContext();

  useEffect(() => {
    navigation.setOptions({ title: account.name });
  }, [account.name, navigation]);

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
    navigation.setOptions({ title: name });
    return { success: true };
  }

  function toggleHideAccount() {
    dispatch(userTogglesHideAccount({ accountId: account.id }));
  }

  return (
    <>
      <Box flex={1} backgroundColor="ink.background-primary">
        <ScrollView
          contentContainerStyle={{
            paddingTop: theme.spacing['5'],
            paddingBottom: theme.spacing['5'] + bottom,
            gap: theme.spacing[5],
          }}
        >
          <Box px="5" gap="6">
            <AccountCard
              Icon={getAvatarIcon(account.icon)}
              name={account.name}
              key={account.id}
              iconTestID={defaultIconTestId(account.icon)}
            />
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
          </Box>
        </ScrollView>
      </Box>
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
