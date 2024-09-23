import { useRef } from 'react';

import { AccountIdentifierSheet } from '@/features/settings/account-identifier/account-identifier-sheet';
import { BitcoinUnitSheet } from '@/features/settings/bitcoin-unit-sheet/bitcoin-unit-sheet';
import { ConversionUnitSheet } from '@/features/settings/conversion-unit-sheet/conversion-unit-sheet';
import { ThemeSheet } from '@/features/settings/theme-sheet/theme-sheet';
import { useSettings } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import {
  BitcoinCircleIcon,
  Box,
  DollarCircleIcon,
  PackageSecurityIcon,
  SheetRef,
  SunInCloudIcon,
} from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

import SettingsScreenLayout from '../settings-screen.layout';
import { DisplayCell } from './display-cell';

export default function SettingsDisplayScreen() {
  const themeSheetRef = useRef<SheetRef>(null);
  const bitcoinUnitSheetRef = useRef<SheetRef>(null);
  const conversionUnitSheetRef = useRef<SheetRef>(null);
  const accountIdentifierSheetRef = useRef<SheetRef>(null);
  const { accountDisplayPreference, bitcoinUnit, conversionUnit, themeStore } = useSettings();
  const { i18n } = useLingui();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <SettingsScreenLayout>
        <DisplayCell
          title={t`Theme`}
          caption={i18n._(capitalize(themeStore))}
          icon={<SunInCloudIcon />}
          onCreateSheetRef={() => {
            themeSheetRef.current?.present();
          }}
        />
        <DisplayCell
          title={t`Bitcoin unit`}
          caption={i18n._(bitcoinUnit.symbol)}
          icon={<BitcoinCircleIcon />}
          onCreateSheetRef={() => {
            bitcoinUnitSheetRef.current?.present();
          }}
        />
        <DisplayCell
          title={t`Conversion unit`}
          caption={i18n._(conversionUnit)}
          icon={<DollarCircleIcon />}
          onCreateSheetRef={() => {
            conversionUnitSheetRef.current?.present();
          }}
        />
        <DisplayCell
          title={t`Account identifier`}
          caption={i18n._(accountDisplayPreference.name)}
          icon={<PackageSecurityIcon />}
          onCreateSheetRef={() => {
            accountIdentifierSheetRef.current?.present();
          }}
        />
      </SettingsScreenLayout>
      <ThemeSheet sheetRef={themeSheetRef} />
      <BitcoinUnitSheet sheetRef={bitcoinUnitSheetRef} />
      <ConversionUnitSheet sheetRef={conversionUnitSheetRef} />
      <AccountIdentifierSheet sheetRef={accountIdentifierSheetRef} />
    </Box>
  );
}
