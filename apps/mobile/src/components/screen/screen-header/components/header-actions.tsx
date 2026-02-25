import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import {
  Box,
  CodeIcon,
  Eye1ClosedIcon,
  Eye1Icon,
  IconButton,
  SettingsGearIcon,
} from '@leather.io/ui/native';

export function HeaderActions() {
  const router = useRouter();
  const { changePrivacyModePreference, privacyModePreference } = useSettings();
  const { hasWallets } = useWallets();

  function onUpdatePrivacyMode() {
    changePrivacyModePreference(privacyModePreference === 'visible' ? 'hidden' : 'visible');
  }

  return (
    <Box alignItems="center" flexDirection="row" justifyContent="center">
      {(__DEV__ || process.env.EXPO_PUBLIC_ENABLE_DEV_CONSOLE) && (
        <IconButton
          label={t`Dev Console`}
          icon={<CodeIcon />}
          onPress={() => router.navigate('/developer-console')}
          testID={TestId.homeDeveloperToolsButton}
        />
      )}
      {hasWallets && (
        <IconButton
          label={getPrivacyLabel(privacyModePreference)}
          icon={privacyModePreference === 'visible' ? <Eye1Icon /> : <Eye1ClosedIcon />}
          onPress={() => onUpdatePrivacyMode()}
          testID={TestId.homePrivacyButton}
        />
      )}

      <IconButton
        label={t`Settings`}
        icon={<SettingsGearIcon />}
        onPress={() => router.navigate('/settings')}
        testID={TestId.homeSettingsButton}
      />
    </Box>
  );
}

function getPrivacyLabel(privacyModePreference: 'visible' | 'hidden') {
  return {
    visible: t`Hide balances`,
    hidden: t`Show balances`,
  }[privacyModePreference];
}
