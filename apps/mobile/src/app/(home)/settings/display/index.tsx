import { useRef } from 'react';

import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { AccountIdentifierSheet } from '@/features/settings/account-identifier-sheet';
import { BitcoinUnitSheet } from '@/features/settings/bitcoin-unit-sheet';
import { ConversionUnitSheet } from '@/features/settings/conversion-unit-sheet';
import { NetworkBadge } from '@/features/settings/network-badge';
import { ThemeSheet } from '@/features/settings/theme-sheet';
import { toggleLocalization } from '@/locales/toggle-localization';
import { useSettings } from '@/store/settings/settings';
import { isDev } from '@/utils/is-dev';
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
    <>
      <AnimatedHeaderScreenLayout
        rightHeaderElement={<NetworkBadge />}
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
              id: `display.theme.${themePreference}`,
              message: capitalize(themePreference),
            })}
            icon={<SunInCloudIcon />}
            onPress={() => {
              themeSheetRef.current?.present();
            }}
          />
          <SettingsListItem
            title={t({
              id: 'display.language.cell_title',
              message: 'Language',
            })}
            caption={i18n._({
              id: 'display.language.cell_caption',
              message: '{locale}',
              values: { locale: i18n.locale },
            })}
            icon={<GlobeIcon />}
            onPress={() => toggleLocalization()}
          />
          {isDev() && (
            <>
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
              message: 'Toggle tactile feedback for touch interactions',
            })}
            icon={<PointerHandIcon />}
            type="switch"
            onSwitchValueChange={() => onUpdateHapticsPreference()}
            switchValue={hapticsPreference === 'enabled'}
          />
        </SettingsList>
      </AnimatedHeaderScreenLayout>
      <ThemeSheet sheetRef={themeSheetRef} />
      <BitcoinUnitSheet sheetRef={bitcoinUnitSheetRef} />
      <ConversionUnitSheet sheetRef={conversionUnitSheetRef} />
      <AccountIdentifierSheet sheetRef={accountIdentifierSheetRef} />
    </>
  );
}
