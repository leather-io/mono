import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountIdentifierModal } from '@/features/settings/account-identifier-modal';
import { BitcoinUnitModal } from '@/features/settings/bitcoin-unit-modal';
import { ConversionUnitModal } from '@/features/settings/conversion-unit-modal';
import { ThemeModal } from '@/features/settings/theme-modal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  BitcoinCircleIcon,
  Box,
  Cell,
  DollarCircleIcon,
  PackageSecurityIcon,
  SunIcon,
  Theme,
} from '@leather.io/ui/native';

export default function SettingsDisplayScreen() {
  const { bottom } = useSafeAreaInsets();
  const themeModalRef = useRef<BottomSheetModal>(null);
  const bitcoinUnitModalRef = useRef<BottomSheetModal>(null);
  const conversionUnitModalRef = useRef<BottomSheetModal>(null);
  const accountIdentifierModalRef = useRef<BottomSheetModal>(null);
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
            themeModalRef.current?.present();
          }}
        />
        <Cell
          title={t`Bitcoin unit`}
          subtitle={t`BTC`}
          Icon={BitcoinCircleIcon}
          onPress={() => {
            themeModalRef.current?.present();
          }}
        />
        <Cell
          title={t`Conversion unit`}
          subtitle={t`USD`}
          Icon={DollarCircleIcon}
          onPress={() => {
            themeModalRef.current?.present();
          }}
        />
        <Cell
          title={t`Account identifier`}
          subtitle={t`BNS name`}
          Icon={PackageSecurityIcon}
          onPress={() => {
            themeModalRef.current?.present();
          }}
        />
      </ScrollView>
      <ThemeModal modalRef={themeModalRef} />
      <BitcoinUnitModal modalRef={bitcoinUnitModalRef} />
      <ConversionUnitModal modalRef={conversionUnitModalRef} />
      <AccountIdentifierModal modalRef={accountIdentifierModalRef} />
    </Box>
  );
}
