import { NetworkBadge } from '@/features/settings/network-badge';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { isFeatureEnabled } from '@/utils/feature-flag';
import { useRouter } from 'expo-router';

import {
  Box,
  Eye1ClosedIcon,
  Eye1Icon,
  PulseIcon,
  SettingsGearIcon,
  TouchableOpacity,
} from '@leather.io/ui/native';

export function HeaderOptions() {
  const { networkPreference } = useSettings();
  const router = useRouter();
  const { changePrivacyModePreference, privacyModePreference } = useSettings();

  function onUpdatePrivacyMode() {
    changePrivacyModePreference(privacyModePreference === 'visible' ? 'hidden' : 'visible');
  }

  return (
    <Box alignItems="center" flexDirection="row" justifyContent="center">
      {networkPreference.id !== 'mainnet' && <NetworkBadge />}
      <TouchableOpacity
        p="2"
        onPress={() => onUpdatePrivacyMode()}
        testID={TestId.homePrivacyButton}
      >
        {privacyModePreference === 'visible' ? <Eye1Icon /> : <Eye1ClosedIcon />}
      </TouchableOpacity>
      <TouchableOpacity
        p="2"
        onPress={() => router.navigate(AppRoutes.Settings)}
        testID={TestId.homeSettingsButton}
      >
        <SettingsGearIcon />
      </TouchableOpacity>
      {isFeatureEnabled() && (
        <TouchableOpacity
          p="2"
          onPress={() => router.navigate(AppRoutes.DeveloperConsole)}
          testID={TestId.homeDeveloperToolsButton}
        >
          <PulseIcon />
        </TouchableOpacity>
      )}
    </Box>
  );
}
