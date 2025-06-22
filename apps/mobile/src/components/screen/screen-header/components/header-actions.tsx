import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import {
  Box,
  Eye1ClosedIcon,
  Eye1Icon,
  IconButton,
  PulseIcon,
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
      <IconButton
        label={getPrivacyLabel(privacyModePreference)}
        icon={privacyModePreference === 'visible' ? <Eye1Icon /> : <Eye1ClosedIcon />}
        onPress={() => onUpdatePrivacyMode()}
        testID={TestId.homePrivacyButton}
      />

      <IconButton
        label={t({
          id: 'header.settings_label',
          message: 'Settings',
        })}
        icon={<SettingsGearIcon />}
        onPress={() => router.navigate('/settings')}
        testID={TestId.homeSettingsButton}
      />
      {hasWallets && (
        <IconButton
          label={t({
            id: 'header.activity_label',
            message: 'Activity',
          })}
          icon={<PulseIcon />}
          onPress={() => router.navigate('/activity')}
          testID={TestId.homeActivityButton}
        />
      )}
    </Box>
  );
}

function getPrivacyLabel(privacyModePreference: 'visible' | 'hidden') {
  return {
    visible: t({
      id: 'header.privacy_label_hide',
      message: 'Hide balances',
    }),
    hidden: t({
      id: 'header.privacy_label_show',
      message: 'Show balances',
    }),
  }[privacyModePreference];
}
