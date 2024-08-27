import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { APP_ROUTES } from '@/constants';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, Text, Theme } from '@leather.io/ui/native';

export default function SettingsScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();

  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['3'],
          paddingTop: theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Text>{t`Hello`}</Text>
        <Button
          onPress={() => {
            router.navigate(APP_ROUTES.WalletWalletsSettings);
          }}
          buttonState="default"
          title={t`Wallets (temp button)`}
        />
      </ScrollView>
    </Box>
  );
}
