import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAvatarIcon } from '@/components/avatar-icon';
import { Cell } from '@/components/cell';
import { AccountCard } from '@/components/wallet-settings/account-card';
import { AccountNameModal } from '@/components/wallet-settings/account-name-modal';
import { Account } from '@/state/accounts/accounts';
import {
  useAccountByIdx,
  userRenamesAccount,
  userTogglesHideAccount,
} from '@/state/accounts/accounts.slice';
import { makeAccountIdentifer, useAppDispatch } from '@/state/utils';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useNavigation } from 'expo-router';

import { Box, Eye1ClosedIcon, HeadIcon, PassportIcon, Theme } from '@leather.io/ui/native';

function ConfigureAccount({
  fingerprint,
  accountIndex,
  account,
}: {
  fingerprint: string;
  accountIndex: number;
  account: Account;
}) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const accountNameModalRef = useRef<BottomSheetModal>(null);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ title: account.name });
  }, []);

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
            <Cell title={t`Hide account`} Icon={Eye1ClosedIcon} onPress={toggleHideAccount} />
          </Box>
        </ScrollView>
      </Box>
      <AccountNameModal name={account.name} setName={setName} modalRef={accountNameModalRef} />
    </>
  );
}

export default function ConfigureAccountScreen() {
  const params = useLocalSearchParams();
  if (!params.wallet || typeof params.wallet !== 'string') {
    throw new Error('No wallet fingerprint is passed in parameters');
  }
  if (!params.account || typeof params.account !== 'string' || Number.isNaN(+params.account)) {
    throw new Error('No account is passed in parameters');
  }
  const fingerprint = params.wallet;
  const accountIndex = +params.account;
  const account = useAccountByIdx(fingerprint, accountIndex);
  if (!account) {
    throw new Error('No account is found');
  }
  return (
    <ConfigureAccount fingerprint={fingerprint} accountIndex={accountIndex} account={account} />
  );
}
