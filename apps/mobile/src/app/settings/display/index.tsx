import { useRef } from 'react';

import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { useLocaleFlag } from '@/features/feature-flags';
import { AccountIdentifierSheet } from '@/features/settings/account-identifier-sheet';
import { BitcoinUnitSheet } from '@/features/settings/bitcoin-unit-sheet';
import { ConversionUnitSheet } from '@/features/settings/conversion-unit-sheet';
import SettingsLayout from '@/features/settings/settings-layout';
import { ThemeSheet } from '@/features/settings/theme-sheet';
import { toggleLocalization } from '@/locales/toggle-localization';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
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
  const releaseLocaleFeature = useLocaleFlag();
  const themeSheetRef = useRef<SheetRef>(null);
  const bitcoinUnitSheetRef = useRef<SheetRef>(null);
  const conversionUnitSheetRef = useRef<SheetRef>(null);
  const accountIdentifierSheetRef = useRef<SheetRef>(null);
  const {
    accountDisplayPreference,
    bitcoinUnitPreference,
    changeHapticsPreference,
    fiatCurrencyPreference,
    hapticsPreference,
    themePreference,
  } = useSettings();
  const { i18n } = useLingui();

  function onUpdateHapticsPreference() {
    changeHapticsPreference(hapticsPreference === 'enabled' ? 'disabled' : 'enabled');
  }

  return (
    <SettingsLayout
      title={t({
        id: 'display.header_title',
        message: 'Display',
      })}
    >
      <SettingsList>
        <SettingsListItem
          title={t({
            id: 'display.theme.cell_title',
            message: 'Theme',
          })}
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

        {releaseLocaleFeature && (
          <>
            <SettingsListItem
              title={i18n._({
                id: 'display.language.cell_title',
                message: '{locale}',
                values: { locale: i18n.locale },
              })}
              caption={i18n._({
                id: 'display.language.cell_caption',
                message: '{locale}',
                values: { locale: i18n.locale },
              })}
              icon={<GlobeIcon />}
              onPress={() => toggleLocalization()}
            />
            <SettingsListItem
              title={t({
                id: 'display.bitcoin_unit.cell_title',
                message: 'Bitcoin unit',
              })}
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

        <SettingsListItem
          title={t({
            id: 'display.conversion_unit.cell_title',
            message: 'Conversion unit',
          })}
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
          title={t({
            id: 'display.account_identifier.cell_title',
            message: 'Account identifier',
          })}
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
          title={t({
            id: 'display.haptics.cell_title',
            message: 'Haptics',
          })}
          caption={t({
            id: 'display.haptics.cell_caption',
            message: 'Toggle tactile feedback for interactions',
          })}
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
    </SettingsLayout>
  );
}
