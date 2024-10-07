import { useRef } from 'react';

import { AccountIdentifierSheet } from '@/features/settings/account-identifier/account-identifier-sheet';
import { BitcoinUnitSheet } from '@/features/settings/bitcoin-unit-sheet/bitcoin-unit-sheet';
import { ConversionUnitSheet } from '@/features/settings/conversion-unit-sheet/conversion-unit-sheet';
import { ThemeSheet } from '@/features/settings/theme-sheet/theme-sheet';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import {
  BitcoinCircleIcon,
  Cell,
  DollarCircleIcon,
  Eye1Icon,
  PackageSecurityIcon,
  SheetRef,
  SunInCloudIcon,
} from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import SettingsScreenLayout from '../settings-screen.layout';

export default function SettingsDisplayScreen() {
  const themeSheetRef = useRef<SheetRef>(null);
  const bitcoinUnitSheetRef = useRef<SheetRef>(null);
  const conversionUnitSheetRef = useRef<SheetRef>(null);
  const accountIdentifierSheetRef = useRef<SheetRef>(null);
  const {
    accountDisplayPreference,
    bitcoinUnitPreference,
    changePrivacyModePreference,
    fiatCurrencyPreference,
    privacyModePreference,
    themePreference,
  } = useSettings();
  const { i18n } = useLingui();

  function onUpdatePrivacyMode() {
    changePrivacyModePreference(privacyModePreference === 'visible' ? 'hidden' : 'visible');
  }

  return (
    <>
      <SettingsScreenLayout>
        <Cell.Root
          title={t`Theme`}
          caption={i18n._(capitalize(themePreference))}
          icon={<SunInCloudIcon />}
          onPress={() => {
            themeSheetRef.current?.present();
          }}
        >
          <Cell.Chevron />
        </Cell.Root>

        <Cell.Root
          title={t`Bitcoin unit`}
          caption={i18n._(bitcoinUnitPreference.symbol)}
          icon={<BitcoinCircleIcon />}
          onPress={() => {
            bitcoinUnitSheetRef.current?.present();
          }}
        >
          <Cell.Chevron />
        </Cell.Root>

        <Cell.Root
          title={t`Conversion unit`}
          caption={i18n._(fiatCurrencyPreference)}
          icon={<DollarCircleIcon />}
          onPress={() => {
            conversionUnitSheetRef.current?.present();
          }}
        >
          <Cell.Chevron />
        </Cell.Root>

        <Cell.Root
          title={t`Account identifier`}
          caption={i18n._(accountDisplayPreference.name)}
          icon={<PackageSecurityIcon />}
          onPress={() => {
            accountIdentifierSheetRef.current?.present();
          }}
        >
          <Cell.Chevron />
        </Cell.Root>

        <Cell.Root
          title={t`Hide home balance`}
          caption={t`Tap your balance to quickly toggle this setting`}
          icon={<Eye1Icon />}
          onPress={() => onUpdatePrivacyMode()}
        >
          <Cell.Switch
            onValueChange={() => onUpdatePrivacyMode()}
            value={privacyModePreference === 'hidden'}
          />
        </Cell.Root>
      </SettingsScreenLayout>
      <ThemeSheet sheetRef={themeSheetRef} />
      <BitcoinUnitSheet sheetRef={bitcoinUnitSheetRef} />
      <ConversionUnitSheet sheetRef={conversionUnitSheetRef} />
      <AccountIdentifierSheet sheetRef={accountIdentifierSheetRef} />
    </>
  );
}
