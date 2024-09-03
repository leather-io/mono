import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAvatarIcon } from '@/components/avatar-icon';
import { AccountCard } from '@/components/wallet-settings/account-card';
import { AccountNameModal } from '@/components/wallet-settings/account-name-modal';
import { Account, AccountLoader } from '@/store/accounts/accounts';
import { userRenamesAccount, userTogglesHideAccount } from '@/store/accounts/accounts.write';
import { makeAccountIdentifer, useAppDispatch } from '@/store/utils';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useNavigation } from 'expo-router';
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

interface ConfigureAccountProps {
  fingerprint: string;
  accountIndex: number;
  account: Account;
}
function ConfigureAccount({ fingerprint, accountIndex, account }: ConfigureAccountProps) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const accountNameModalRef = useRef<SheetRef>(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: account.name });
  }, [account.name, navigation]);

  function setName(name: string) {
    dispatch(
      userRenamesAccount({
        accountId: makeAccountIdentifer(fingerprint, accountIndex),
        name,
      })
    );
    navigation.setOptions({ title: name });
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
            <AccountCard Icon={getAvatarIcon(account.icon)} name={account.name} key={account.id} />
            <Cell
              title={t`Name`}
              subtitle={account.name}
              Icon={PassportIcon}
              onPress={() => {
                accountNameModalRef.current?.present();
              }}
            />
            <Cell title={t`Avatar`} Icon={HeadIcon} onPress={() => {}} />
            <Cell
              title={t`Hide account`}
              Icon={Eye1ClosedIcon}
              onPress={toggleHideAccount}
              variant="switch"
              switchValue={account.status === 'hidden'}
              toggleSwitchValue={toggleHideAccount}
            />
          </Box>
        </ScrollView>
      </Box>
      <AccountNameModal name={account.name} setName={setName} sheetRef={accountNameModalRef} />
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
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex} fallback={null}>
      {account => (
        <ConfigureAccount fingerprint={fingerprint} accountIndex={accountIndex} account={account} />
      )}
    </AccountLoader>
  );
}
