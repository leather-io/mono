import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, ButtonV2, Sheet, Text } from '@leather.io/ui/native';

import { UpdateButton } from './update-button';

interface AppUpdateRequiredSheetProps {
  isLoading?: boolean;
  onUpdatePress?: () => void;
}

export function AppUpdateRequiredSheet({ onUpdatePress }: AppUpdateRequiredSheetProps) {
  const { versionGuardSheetRef } = useGlobalSheets();
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet ref={versionGuardSheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box maxWidth={400} alignItems="center" alignSelf="center">
        <Box pb="4" pt="6" px="5" flexDirection="row">
          <Box flex={1.4} gap="5">
            <Text color="ink.text-primary" variant="heading05">
              {t({
                id: 'version_guard.title',
                message: 'Get the latest version of the Leather app',
              })}
            </Text>
            <Text variant="body02" color="ink.text-primary" textAlign="left">
              {t({
                id: 'version_guard.update_available',
                message: `Update the app to get access to the latest features.`,
              })}
            </Text>
          </Box>
          <Box flex={1} style={{ height: 160, width: 160 }}>
            <Image
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: -16,
                transform: [{ scaleX: -1 }],
              }}
              contentFit="contain"
              source={require('@/assets/stickers/app-disabled.png')}
            />
          </Box>
        </Box>
      </Box>
      <Box width="100%" px="5" maxWidth={400} alignSelf="center" gap="4">
        <UpdateButton onPress={onUpdatePress} />
        <ButtonV2
          title={t({ id: 'version_guard.decline_version', message: `Maybe later` })}
          onPress={() => versionGuardSheetRef.current?.dismiss()}
          buttonState="ghost"
        />
      </Box>
    </Sheet>
  );
}
