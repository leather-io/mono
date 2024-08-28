import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Divider } from '@/components/divider';
import { APP_ROUTES } from '@/routes';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import {
  Accordion,
  BellIcon,
  Box,
  Button,
  Cell,
  GlobeTiltedIcon,
  SettingsSliderThreeIcon,
  ShieldIcon,
  SunIcon,
  SupportIcon,
  Text,
  Theme,
  WalletIcon,
} from '@leather.io/ui/native';

export default function SettingsScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();

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
          title={t`Wallets and accounts`}
          subtitle={t`Add, configure and remove`}
          Icon={WalletIcon}
          onPress={() => {
            router.navigate(APP_ROUTES.WalletWalletsSettings);
          }}
        />
        <Divider />
        <Cell
          title={t`Display`}
          subtitle={t`Theme, bitcoin unit and more`}
          Icon={SunIcon}
          onPress={() => {
            router.navigate(APP_ROUTES.WalletSettingsDisplay);
          }}
        />
        <Cell
          title={t`Security`}
          subtitle={t`Analytics and app authentication`}
          Icon={ShieldIcon}
          onPress={() => {
            router.navigate(APP_ROUTES.WalletSettingsSecurity);
          }}
        />
        <Cell
          title={t`Networks`}
          subtitle={t`Mainnet, testnet or signet`}
          Icon={GlobeTiltedIcon}
          onPress={() => {
            router.navigate(APP_ROUTES.WalletSettingsNetworks);
          }}
        />
        <Cell
          title={t`Notifications`}
          subtitle={t`Push and email notifications`}
          Icon={BellIcon}
          onPress={() => {
            router.navigate(APP_ROUTES.WalletSettingsNotifications);
          }}
        />
        <Cell
          title={t`Help`}
          subtitle={t`Support, guides and articles`}
          Icon={SupportIcon}
          onPress={() => {
            router.navigate(APP_ROUTES.WalletSettingsHelp);
          }}
        />
        <Accordion
          label={t`More options`}
          content={
            <>
              <Cell title={t`Contacts`} Icon={SupportIcon} />
              <Cell title={t`Fees`} Icon={SettingsSliderThreeIcon} />
            </>
          }
        />
        {/* TODO: Replace with shared Footer */}
        <Box mb="5">
          <Divider />
          <Box pt="5" pb="5">
            <Text variant="label01">{t`Version`}</Text>
            <Text variant="caption01" color="ink.text-subdued">
              0.0
            </Text>
          </Box>
          <Button onPress={() => {}} buttonState="outline" title={t`Lock app`} />
        </Box>
      </ScrollView>
    </Box>
  );
}
