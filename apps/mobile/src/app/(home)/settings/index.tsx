import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Divider } from '@/components/divider';
import { AppRoutes } from '@/routes';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';

import {
  Accordion,
  BellIcon,
  Box,
  Button,
  Cell,
  GlobeTiltedIcon,
  SettingsGearIcon,
  ShieldIcon,
  SquareLinesBottomIcon,
  SupportIcon,
  Text,
  Theme,
  UsersTwoIcon,
  WalletIcon,
} from '@leather.io/ui/native';

export default function SettingsScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();

  return (
    <Box backgroundColor="ink.background-primary" flex={1}>
      <ScrollView>
        <Box paddingHorizontal="5" paddingVertical="5">
          <Cell.Root
            title={t`Wallets and accounts`}
            caption={t`Add, configure and remove`}
            icon={<WalletIcon />}
            onPress={() => router.navigate(AppRoutes.SettingsWallet)}
          >
            <Cell.Chevron />
          </Cell.Root>
        </Box>
        <Divider />
        <Box gap="2" paddingHorizontal="5" paddingVertical="5">
          <Cell.Root
            py="2"
            title={t`Display`}
            caption={t`Theme, bitcoin unit and more`}
            icon={<SquareLinesBottomIcon />}
            onPress={() => router.navigate(AppRoutes.SettingsDisplay)}
          >
            <Cell.Chevron />
          </Cell.Root>
          <Cell.Root
            py="2"
            title={t`Security`}
            caption={t`Analytics and app authentication`}
            icon={<ShieldIcon />}
            onPress={() => router.navigate(AppRoutes.SettingsSecurity)}
          >
            <Cell.Chevron />
          </Cell.Root>
          <Cell.Root
            py="2"
            title={t`Networks`}
            caption={t`Mainnet, testnet or signet`}
            icon={<GlobeTiltedIcon />}
            onPress={() => router.navigate(AppRoutes.SettingsNetworks)}
          >
            <Cell.Chevron />
          </Cell.Root>

          <Cell.Root
            py="2"
            title={t`Notifications`}
            caption={t`Push and email notifications`}
            icon={<BellIcon />}
            onPress={() => router.navigate(AppRoutes.SettingsNotifications)}
          >
            <Cell.Chevron />
          </Cell.Root>

          <Cell.Root
            py="2"
            title={t`Help`}
            caption={t`Support, guides and articles`}
            icon={<SupportIcon />}
            onPress={() => router.navigate(AppRoutes.SettingsHelp)}
          >
            <Cell.Chevron />
          </Cell.Root>
          <Accordion
            label={t`More options`}
            content={
              <>
                <Cell.Root py="2" title={t`Contacts`} icon={<UsersTwoIcon />}>
                  <Cell.Chevron />
                </Cell.Root>
                <Cell.Root py="2" title={t`Fees`} icon={<SettingsGearIcon />}>
                  <Cell.Chevron />
                </Cell.Root>
              </>
            }
          />
        </Box>
        <Divider />
        <Box
          mb="5"
          style={{
            paddingBottom: theme.spacing['5'] + bottom,
            paddingHorizontal: theme.spacing['5'],
          }}
        >
          <Box pt="5" pb="5">
            <Text variant="label01">{t`Version`}</Text>
            <Text variant="caption01" color="ink.text-subdued">
              {process.env.NODE_ENV === 'development'
                ? Application.nativeBuildVersion
                : Application.nativeApplicationVersion}
            </Text>
          </Box>
          <Button onPress={() => {}} buttonState="outline" title={t`Lock app`} />
        </Box>
      </ScrollView>
    </Box>
  );
}
