import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountIdentifierSheet } from '@/features/settings/account-identifier-sheet';
import { BitcoinUnitSheet } from '@/features/settings/bitcoin-unit-sheet';
import { ConversionUnitSheet } from '@/features/settings/conversion-unit-sheet';
import { ThemeSheet } from '@/features/settings/theme-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  BitcoinCircleIcon,
  Box,
  Cell,
  DollarCircleIcon,
  PackageSecurityIcon,
  SheetRef,
  SunIcon,
  Theme,
} from '@leather.io/ui/native';

export default function SettingsDisplayScreen() {
  const { bottom } = useSafeAreaInsets();
  const themeSheetRef = useRef<SheetRef>(null);
  const bitcoinUnitSheetRef = useRef<SheetRef>(null);
  const conversionUnitSheetRef = useRef<SheetRef>(null);
  const accountIdentifierSheetRef = useRef<SheetRef>(null);
  const theme = useTheme<Theme>();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Cell
          title={t`Theme`}
          subtitle={t`System`}
          Icon={SunIcon}
          onPress={() => {
            themeSheetRef.current?.present();
          }}
        />
        <Cell
          title={t`Bitcoin unit`}
          subtitle={t`BTC`}
          Icon={BitcoinCircleIcon}
          onPress={() => {
            themeSheetRef.current?.present();
          }}
        />
        <Cell
          title={t`Conversion unit`}
          subtitle={t`USD`}
          Icon={DollarCircleIcon}
          onPress={() => {
            themeSheetRef.current?.present();
          }}
        />
        <Cell
          title={t`Account identifier`}
          subtitle={t`BNS name`}
          Icon={PackageSecurityIcon}
          onPress={() => {
            themeSheetRef.current?.present();
          }}
        />
      </ScrollView>
      <ThemeSheet sheetRef={themeSheetRef} />
      <BitcoinUnitSheet sheetRef={bitcoinUnitSheetRef} />
      <ConversionUnitSheet sheetRef={conversionUnitSheetRef} />
      <AccountIdentifierSheet sheetRef={accountIdentifierSheetRef} />
    </Box>
  );
}
