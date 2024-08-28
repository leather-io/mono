import { useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsModal } from '@/features/settings/analytics-modal';
import { AppAuthenticationModal } from '@/features/settings/app-authentication-modal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Cell, CookieIcon, KeyholeIcon, Theme } from '@leather.io/ui/native';

export default function SettingsSecurityScreen() {
  const { bottom } = useSafeAreaInsets();
  const analyticsModalRef = useRef<BottomSheetModal>(null);
  const appAuthenticationModalRef = useRef<BottomSheetModal>(null);
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
      <AnalyticsModal modalRef={analyticsModalRef} />
      <AppAuthenticationModal modalRef={appAuthenticationModalRef} />
    </Box>
  );
}
