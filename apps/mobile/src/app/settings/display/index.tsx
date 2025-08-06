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
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import {
  BitcoinCircleIcon,
  DollarCircleIcon,
  GlobeIcon,
  PackageSecurityIcon,
  PointerHandIcon,
  SheetRef,
  SunInCloudIcon,
} from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

export default function SettingsDisplayScreen() {
  const btcConversionUnitEnabled = useBtcConversionUnitFlag();
  const i18nEnabled = useInternationalizationFlag();
  const themeSheetRef = useRef<SheetRef>(null);
  const bitcoinUnitSheetRef = useRef<SheetRef>(null);
  const conversionUnitSheetRef = useRef<SheetRef>(null);
  const accountIdentifierSheetRef = useRef<SheetRef>(null);
  const languageSheetRef = useRef<SheetRef>(null);
  const {
    accountDisplayPreference,
    bitcoinUnitPreference,
    changeHapticsPreference,
    fiatCurrencyPreference,
    hapticsPreference,
    languagePreference,
    themePreference,
  } = useSettings();
  const { i18n } = useLingui();

  function onUpdateHapticsPreference() {
    changeHapticsPreference(hapticsPreference === 'enabled' ? 'disabled' : 'enabled');
  }

  return (
    <SettingsLayout title={t`Display`}>
      <SettingsList>
        <SettingsListItem
          title={t`Theme`}
          caption={i18n._({
            id: 'display.theme.cell_caption',
            message: '{theme}',
            values: { theme: capitalize(themePreference) },
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
              caption={i18n._({
                id: 'display.bitcoin_unit.cell_caption',
                message: '{symbol}',
                values: { symbol: bitcoinUnitPreference.symbol },
              })}
              icon={<BitcoinCircleIcon />}
              onPress={() => {
                bitcoinUnitSheetRef.current?.present();
              }}
            />
          </>
        )}

        {i18nEnabled && (
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
          caption={i18n._({
            id: 'display.conversion_unit.cell_caption',
            message: '{currency}',
            values: { currency: fiatCurrencyPreference },
          })}
          icon={<DollarCircleIcon />}
          onPress={() => {
            conversionUnitSheetRef.current?.present();
          }}
        />
        <SettingsListItem
          title={t`Account identifier`}
          caption={i18n._({
            id: 'display.account_identifier.cell_caption',
            message: '{name}',
            values: { name: accountDisplayPreference.name },
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
