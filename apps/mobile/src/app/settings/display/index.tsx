import { useRef } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useBtcConversionUnitFlag, useInternationalizationFlag } from '@/features/feature-flags';
import { AccountIdentifierSheet } from '@/features/settings/account-identifier-sheet';
import { BitcoinUnitSheet } from '@/features/settings/bitcoin-unit-sheet';
import { ConversionUnitSheet } from '@/features/settings/conversion-unit-sheet';
import { LanguageSheet } from '@/features/settings/language-sheet';
import SettingsLayout from '@/features/settings/settings-layout';
import { ThemeSheet } from '@/features/settings/theme-sheet';
import { supportedLanguages } from '@/i18n/languages';
import { useSettings } from '@/store/settings/settings';
import { select, t } from '@lingui/core/macro';
import { keys } from 'remeda';

import {
  BitcoinCircleIcon,
  DollarCircleIcon,
  GlobeIcon,
  PackageSecurityIcon,
  PointerHandIcon,
  SheetInstance,
  SunInCloudIcon,
} from '@leather.io/ui/native';

export default function SettingsDisplayScreen() {
  const btcConversionUnitEnabled = useBtcConversionUnitFlag();
  const i18nEnabled = useInternationalizationFlag();
  const shouldShowLanguageSetting = i18nEnabled && keys(supportedLanguages).length > 1;
  const themeSheetRef = useRef<SheetInstance>(null);
  const bitcoinUnitSheetRef = useRef<SheetInstance>(null);
  const conversionUnitSheetRef = useRef<SheetInstance>(null);
  const accountIdentifierSheetRef = useRef<SheetInstance>(null);
  const languageSheetRef = useRef<SheetInstance>(null);
  const {
    accountDisplayPreference,
    bitcoinUnitPreference,
    changeHapticsPreference,
    fiatCurrencyPreference,
    hapticsPreference,
    languagePreference,
    themePreference,
  } = useSettings();
  const accountIdentifierType = accountDisplayPreference.type.replace(/-/g, '_');

  function onUpdateHapticsPreference() {
    changeHapticsPreference(hapticsPreference === 'enabled' ? 'disabled' : 'enabled');
  }

  return (
    <SettingsLayout title={t`Display`}>
      <SettingsList>
        <SettingsListItem
          title={t`Theme`}
          caption={t({
            message: select(themePreference, {
              light: 'Light',
              dark: 'Dark',
              system: 'System',
              other: 'Unknown',
            }),
          })}
          icon={<SunInCloudIcon />}
          onPress={() => {
            themeSheetRef.current?.present();
          }}
        />
        {btcConversionUnitEnabled && (
          <>
            <SettingsListItem
              title={t`Bitcoin unit`}
              caption={bitcoinUnitPreference.symbol}
              icon={<BitcoinCircleIcon />}
              onPress={() => {
                bitcoinUnitSheetRef.current?.present();
              }}
            />
          </>
        )}
        {shouldShowLanguageSetting && (
          <SettingsListItem
            title={t`Language`}
            caption={supportedLanguages[languagePreference]}
            icon={<GlobeIcon />}
            onPress={() => {
              languageSheetRef.current?.present();
            }}
          />
        )}
        <SettingsListItem
          title={t`Conversion unit`}
          caption={fiatCurrencyPreference}
          icon={<DollarCircleIcon />}
          onPress={() => {
            conversionUnitSheetRef.current?.present();
          }}
        />
        <SettingsListItem
          title={t`Account identifier`}
          caption={t({
            message: select(accountIdentifierType, {
              native_segwit: 'Native Segwit address',
              taproot: 'Taproot address',
              bns: 'BNS name',
              stacks: 'Stacks address',
              other: 'Unknown',
            }),
          })}
          icon={<PackageSecurityIcon />}
          onPress={() => {
            accountIdentifierSheetRef.current?.present();
          }}
        />
        <SettingsListItem
          title={t`Haptics`}
          caption={t`Toggle tactile feedback for interactions`}
          icon={<PointerHandIcon />}
          type="switch"
          onSwitchValueChange={() => onUpdateHapticsPreference()}
          switchValue={hapticsPreference === 'enabled'}
        />
      </SettingsList>
      <ThemeSheet sheetRef={themeSheetRef} />
      <BitcoinUnitSheet sheetRef={bitcoinUnitSheetRef} />
      <ConversionUnitSheet sheetRef={conversionUnitSheetRef} />
      <AccountIdentifierSheet sheetRef={accountIdentifierSheetRef} />
      <LanguageSheet sheetRef={languageSheetRef} />
    </SettingsLayout>
  );
}
