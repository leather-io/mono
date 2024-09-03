import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountIdentifierSheet } from '@/features/settings/account-identifier-sheet';
import { BitcoinUnitSheet } from '@/features/settings/bitcoin-unit-sheet';
import { ConversionUnitSheet } from '@/features/settings/conversion-unit-sheet';
import { ThemeSheet } from '@/features/settings/theme-sheet/theme-sheet';
import { useSettings } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { useTheme } from '@shopify/restyle';

import {
  Avatar,
  BitcoinCircleIcon,
  Box,
  Cell,
  ChevronRightIcon,
  DollarCircleIcon,
  Flag,
  ItemLayout,
  PackageSecurityIcon,
  SheetRef,
  SunInCloudIcon,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';
import { capitalize } from '@leather.io/utils';

export default function SettingsDisplayScreen() {
  const { bottom } = useSafeAreaInsets();
  const themeSheetRef = useRef<SheetRef>(null);
  const bitcoinUnitSheetRef = useRef<SheetRef>(null);
  const conversionUnitSheetRef = useRef<SheetRef>(null);
  const accountIdentifierSheetRef = useRef<SheetRef>(null);
  const theme = useTheme<Theme>();
  const { themeStore } = useSettings();
  const { i18n } = useLingui();

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
        <TouchableOpacity
          onPress={() => {
            themeSheetRef.current?.present();
          }}
        >
          <Flag
            img={
              <Avatar>
                <SunInCloudIcon />
              </Avatar>
            }
          >
            <ItemLayout
              actionIcon={<ChevronRightIcon variant="small" />}
              captionLeft={i18n._(capitalize(themeStore))}
              titleLeft={t`Theme`}
            />
          </Flag>
        </TouchableOpacity>
        <Cell
          title={t`Bitcoin unit`}
          subtitle={t`BTC`}
          Icon={BitcoinCircleIcon}
          onPress={() => {
            bitcoinUnitSheetRef.current?.present();
          }}
        />
        <Cell
          title={t`Conversion unit`}
          subtitle={t`USD`}
          Icon={DollarCircleIcon}
          onPress={() => {
            conversionUnitSheetRef.current?.present();
          }}
        />
        <Cell
          title={t`Account identifier`}
          subtitle={t`BNS name`}
          Icon={PackageSecurityIcon}
          onPress={() => {
            accountIdentifierSheetRef.current?.present();
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
