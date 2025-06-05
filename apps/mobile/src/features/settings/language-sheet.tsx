import { useState } from 'react';
import { Modal } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { AvailableLanguageCode, supportedLanguages } from '@/i18n/languages';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import { useTheme } from '@shopify/restyle';
import { reloadAppAsync } from 'expo';
import { entries } from 'remeda';

import { Box, GlobeIcon, SheetRef, Theme } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface LanguageSheetProps {
  sheetRef: SheetRef;
}
export function LanguageSheet({ sheetRef }: LanguageSheetProps) {
  const settings = useSettings();
  const [isSwitchingLanguages, setIsSwitchingLanguages] = useState(false);
  const splashDuration = 1000;

  function handleLanguageSelection(language: AvailableLanguageCode) {
    if (settings.languagePreference === language) {
      return;
    }
    setLanguagePreference(settings, language);
    setIsSwitchingLanguages(true);
    setTimeout(reloadAppAsync, splashDuration);
  }

  return (
    <>
      <SettingsSheetLayout sheetRef={sheetRef} title={t`Language`}>
        <SettingsList gap="0">
          {entries(supportedLanguages).map(([code, name]) => (
            <SettingsListItem
              key={code}
              title={name}
              onPress={() => handleLanguageSelection(code)}
              type="radio"
              isRadioSelected={settings.languagePreference === code}
            />
          ))}
        </SettingsList>
      </SettingsSheetLayout>
      {isSwitchingLanguages && <LanguageSwitchSplash />}
    </>
  );
}

function LanguageSwitchSplash() {
  const theme = useTheme<Theme>();
  const fadeInDurationMs = 300;

  return (
    <Modal transparent>
      <Animated.View
        entering={FadeIn.duration(fadeInDurationMs)}
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors['ink.background-primary'],
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Box flexDirection="column" alignItems="center">
          <GlobeIcon variant="large" />
        </Box>
      </Animated.View>
    </Modal>
  );
}

function setLanguagePreference(
  settings: ReturnType<typeof useSettings>,
  language: AvailableLanguageCode
) {
  settings.changeLanguagePreference(language);
  settings.changeLanguagePreferenceSource('user-selection');
}
