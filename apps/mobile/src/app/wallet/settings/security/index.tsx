import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsSheet } from '@/features/settings/analytics-sheet';
import { AppAuthenticationSheet } from '@/features/settings/app-authentication-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Cell, CookieIcon, KeyholeIcon, SheetRef, Theme } from '@leather.io/ui/native';

export default function SettingsSecurityScreen() {
  const { bottom } = useSafeAreaInsets();
  const analyticsModalRef = useRef<SheetRef>(null);
  const appAuthenticationModalRef = useRef<SheetRef>(null);
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
          title={t`Analytics`}
          subtitle={t`Enabled`}
          Icon={CookieIcon}
          onPress={() => {
            analyticsModalRef.current?.present();
          }}
        />
        <Cell
          title={t`App authentication`}
          subtitle={t`Enabled`}
          Icon={KeyholeIcon}
          onPress={() => {
            appAuthenticationModalRef.current?.present();
          }}
        />
      </ScrollView>
      <AnalyticsSheet sheetRef={analyticsModalRef} />
      <AppAuthenticationSheet sheetRef={appAuthenticationModalRef} />
    </Box>
  );
}
