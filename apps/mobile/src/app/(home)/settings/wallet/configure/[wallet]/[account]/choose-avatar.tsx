import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountIcon, accountIconMap } from '@/features/accounts/components/account-avatar';
import { Avatars } from '@/features/settings/choose-avatar/avatars';
import { useScrollViewStyles } from '@/hooks/use-scroll-view-styles';
import { Account } from '@/store/accounts/accounts';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { userUpdatesAccountIcon } from '@/store/accounts/accounts.write';
import { useAppDispatch } from '@/store/utils';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { AccountId } from '@leather.io/models';
import { Box, Button, SquircleBox, Text, Theme } from '@leather.io/ui/native';
import { isString } from '@leather.io/utils';

interface ChooseAvatarProps extends AccountId {
  account: Account;
}
function ChooseAvatar({ fingerprint, accountIndex, account }: ChooseAvatarProps) {
  const defaultStyles = useScrollViewStyles();
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const router = useRouter();
  const [newIcon, setNewIcon] = useState<AccountIcon | null>(null);
  const PreviewIcon = accountIconMap[newIcon ?? account.icon];

  useEffect(() => {
    navigation.setOptions({ title: account.name });
  }, [account.name, navigation]);

  const isSubmitDisabled = newIcon === null;

  function setAvatar(icon: string) {
    const payload = { fingerprint, accountIndex, icon };
    dispatch(userUpdatesAccountIcon(payload));
    router.back();
  }

  function onSubmit() {
    if (newIcon) {
      setAvatar(newIcon);
    }
  }

  return (
    <Box bg="ink.background-primary" flex={1}>
      <ScrollView contentContainerStyle={defaultStyles}>
        <Box gap="5">
          <SquircleBox
            alignSelf="center"
            width={124}
            height={124}
            borderWidth={1}
            borderColor="ink.border-transparent"
            borderRadius={48}
            cornerSmoothing={100}
            preserveSmoothing={true}
            justifyContent="center"
            alignItems="center"
          >
            {PreviewIcon && <PreviewIcon width={64} height={64} />}
          </SquircleBox>

          <Text variant="label01">
            {t({
              id: 'choose_avatar.images.subtitle',
              message: 'Icons',
            })}
          </Text>
          <Avatars currentIcon={newIcon ?? account.icon} setNewIcon={setNewIcon} />
        </Box>
      </ScrollView>
      <Box
        style={{ paddingBottom: bottom + theme.spacing['5'] }}
        px="5"
        pt="2"
        bg="ink.background-primary"
      >
        <Button
          disabled={isSubmitDisabled}
          onPress={onSubmit}
          buttonState={isSubmitDisabled ? 'disabled' : 'default'}
          title={t({
            id: 'choose_avatar.button',
            message: 'Save',
          })}
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
