import { useRef } from 'react';

import { Divider } from '@/components/divider';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { NetworkBadge } from '@/components/network-badge';
import { NotifyUserSheet } from '@/components/sheets/notify-user-sheet.layout';
import { useAuthContext } from '@/components/splash-screen-guard/use-auth-context';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
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
  SheetRef,
  ShieldIcon,
  SquareLinesBottomIcon,
  SupportIcon,
  Text,
  UsersTwoIcon,
  WalletIcon,
} from '@leather.io/ui/native';

export default function SettingsScreen() {
  const contactsSheetRef = useRef<SheetRef>(null);
  const feesSheetRef = useRef<SheetRef>(null);
  const router = useRouter();
  const { lockApp } = useAuthContext();

  return (
    <>
      <AnimatedHeaderScreenLayout
        rightHeaderElement={<NetworkBadge />}
        title={t({
          id: 'settings.header_title',
          message: 'Settings',
        })}
      >
        <Cell.Root
          title={t({
            id: 'settings.wallets.cell_title',
            message: 'Wallets and accounts',
          })}
          caption={t({
            id: 'settings.wallets.cell_caption',
            message: 'Add, configure and remove',
          })}
          icon={<WalletIcon />}
          onPress={() => router.navigate(AppRoutes.SettingsWallet)}
          testID={TestId.settingsWalletAndAccountsButton}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Divider />
        <Cell.Root
          title={t({
            id: 'settings.display.cell_title',
            message: 'Display',
          })}
          caption={t({
            id: 'settings.display.cell_caption',
            message: 'Theme, bitcoin unit and more',
          })}
          icon={<SquareLinesBottomIcon />}
          onPress={() => router.navigate(AppRoutes.SettingsDisplay)}
          testID={TestId.settingsDisplayButton}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Cell.Root
          title={t({
            id: 'settings.security.cell_title',
            message: 'Security',
          })}
          caption={t({
            id: 'settings.security.cell_caption',
            message: 'Analytics and app authentication',
          })}
          icon={<ShieldIcon />}
          onPress={() => router.navigate(AppRoutes.SettingsSecurity)}
          testID={TestId.settingsSecurityButton}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Cell.Root
          title={t({
            id: 'settings.networks.cell_title',
            message: 'Networks',
          })}
          caption={t({
            id: 'settings.networks.cell_caption',
            message: 'Mainnet, testnet or signet',
          })}
          icon={<GlobeTiltedIcon />}
          onPress={() => router.navigate(AppRoutes.SettingsNetworks)}
          testID={TestId.settingsNetworkButton}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Cell.Root
          py="3"
          title={t({
            id: 'settings.notifications.cell_title',
            message: 'Notifications',
          })}
          caption={t({
            id: 'settings.notifications.cell_caption',
            message: 'Push and email notifications',
          })}
          icon={<BellIcon />}
          onPress={() => router.navigate(AppRoutes.SettingsNotifications)}
          testID={TestId.settingsNotificationsButton}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Cell.Root
          title={t({
            id: 'settings.help.cell_title',
            message: 'Help',
          })}
          caption={t({
            id: 'settings.help.cell_caption',
            message: 'Support, guides and articles',
          })}
          icon={<SupportIcon />}
          onPress={() => router.navigate(AppRoutes.SettingsHelp)}
          testID={TestId.settingsHelpButton}
        >
          <Cell.Chevron />
        </Cell.Root>
        <Accordion
          label={t({
            id: 'settings.accordion_label',
            message: 'More options',
          })}
          testID={TestId.settingsMoreOptionsButton}
          content={
            <>
              <Cell.Root
                title={t({
                  id: 'settings.contacts.cell_title',
                  message: 'Contacts',
                })}
                icon={<UsersTwoIcon />}
                onPress={() => {
                  contactsSheetRef.current?.present();
                }}
                testID={TestId.settingsContactsButton}
              >
                <Cell.Chevron />
              </Cell.Root>
              <Cell.Root
                title={t({
                  id: 'settings.fees.cell_title',
                  message: 'Fees',
                })}
                icon={<SettingsGearIcon />}
                onPress={() => {
                  feesSheetRef.current?.present();
                }}
                testID={TestId.settingsFeesButton}
              >
                <Cell.Chevron />
              </Cell.Root>
            </>
          }
        />
        <Divider />
        <Box py="3">
          <Text variant="label01">
            {t({
              id: 'settings.version_label',
              message: 'Version',
            })}
          </Text>
          <Text variant="caption01" color="ink.text-subdued">
            {Application.nativeApplicationVersion} / {Application.nativeBuildVersion}
          </Text>
        </Box>
        <Button
          onPress={lockApp}
          buttonState="outline"
          title={t({
            id: 'settings.lock_button',
            message: 'Lock app',
          })}
          testID={TestId.settingsLockAppButton}
        />
      </AnimatedHeaderScreenLayout>
      <NotifyUserSheet
        sheetData={{
          title: t({
            id: 'contacts.header_title',
            message: 'Contacts',
          }),
        }}
        sheetRef={contactsSheetRef}
      />
      <NotifyUserSheet
        sheetData={{
          title: t({
            id: 'fees.header_title',
            message: 'Custom fees',
          }),
        }}
        sheetRef={feesSheetRef}
      />
    </>
  );
}
