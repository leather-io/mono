import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useToastContext } from '@/components/toast/toast-context';
import { Avatars } from '@/features/settings/choose-avatar/avatars';
import { AccountId } from '@/models/domain.model';
import { Account } from '@/store/accounts/accounts';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { userUpdatesAccountIcon } from '@/store/accounts/accounts.write';
import { useAppDispatch } from '@/store/utils';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { Box, Button, Text, Theme } from '@leather.io/ui/native';
import { isString } from '@leather.io/utils';

interface ChooseAvatarProps extends AccountId {
  account: Account;
}
function ChooseAvatar({ fingerprint, accountIndex, account }: ChooseAvatarProps) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const router = useRouter();
  const [newIcon, setNewIcon] = useState<string | null>(null);
  const { displayToast } = useToastContext();

  useEffect(() => {
    navigation.setOptions({ title: account.name });
  }, [account.name, navigation]);

  const isSubmitDisalbed = newIcon === null;

  function setAvatar(icon: string) {
    const payload = { fingerprint, accountIndex, icon };
    dispatch(userUpdatesAccountIcon(payload));
    router.back();
    displayToast({ type: 'success', title: t`Account label updated` });
  }

  function onSubmit() {
    if (newIcon) {
      setAvatar(newIcon);
    }
  }

  return (
    <Box flex={1} backgroundColor="ink.background-primary" justifyContent="space-between">
      <ScrollView
        contentContainerStyle={{
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Box px="5" gap="6">
          <Text variant="heading03">{t`Choose account avatar`}</Text>
          <Text variant="heading05">{t`Choose an image`}</Text>
          <Avatars currentIcon={newIcon ?? account.icon} setNewIcon={setNewIcon} />
          <Text variant="heading05">{t`Or choose one of your collectibles`}</Text>
        </Box>
      </ScrollView>
      <Box
        style={{ paddingBottom: bottom + theme.spacing['5'] }}
        px="5"
        pt="2"
        bg="ink.background-primary"
      >
        <Button
          disabled={isSubmitDisalbed}
          onPress={onSubmit}
          buttonState={isSubmitDisalbed ? 'disabled' : 'default'}
          title={t`Confirm`}
        />
      </Box>
    </Box>
  );
}

export default function ChooseAvatarScreen() {
  const params = useLocalSearchParams();
  if (!params.wallet || !isString(params.wallet)) {
    throw new Error('No wallet fingerprint is passed in parameters');
  }
  if (!params.account || !isString(params.account) || Number.isNaN(+params.account)) {
    throw new Error('No account is passed in parameters');
  }
  const fingerprint = params.wallet;
  const accountIndex = +params.account;
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!account) {
    throw new Error('No account is found');
  }
  return <ChooseAvatar fingerprint={fingerprint} accountIndex={accountIndex} account={account} />;
}
