import { AppRoutes } from '@/routes';
import { isProduction } from '@/shared/environment';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { useRouter } from 'expo-router';

import {
  Box,
  Eye1ClosedIcon,
  Eye1Icon,
  Pressable,
  PulseIcon,
  SettingsGearIcon,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

export function HeaderOptions() {
  const router = useRouter();
  const { changePrivacyModePreference, privacyModePreference } = useSettings();

  function onUpdatePrivacyMode() {
    changePrivacyModePreference(privacyModePreference === 'visible' ? 'hidden' : 'visible');
  }

  return (
    <Box alignItems="center" flexDirection="row" justifyContent="center">
      <Pressable
        p="2"
        onPress={() => onUpdatePrivacyMode()}
        testID={TestId.homePrivacyButton}
        pressEffects={legacyTouchablePressEffect}
      >
        {privacyModePreference === 'visible' ? <Eye1Icon /> : <Eye1ClosedIcon />}
      </Pressable>
      <Pressable
        p="2"
        onPress={() => router.navigate(AppRoutes.Settings)}
        testID={TestId.homeSettingsButton}
        pressEffects={legacyTouchablePressEffect}
      >
        <SettingsGearIcon />
      </Pressable>

      <Pressable
        p="2"
        onPress={() => router.navigate(AppRoutes.Activity)}
        testID={TestId.homeActivityButton}
        pressEffects={legacyTouchablePressEffect}
      >
        <PulseIcon />
      </Pressable>
    </Box>
  );
}
