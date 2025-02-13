import { useRef } from 'react';

import { Divider } from '@/components/divider';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { NotifyUserSheetLayout } from '@/components/sheets/notify-user-sheet.layout';
import { useAuthContext } from '@/components/splash-screen-guard/use-auth-context';
import { NetworkBadge } from '@/features/settings/network-badge';
import { WaitlistIds } from '@/features/waitlist/ids';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { isDev } from '@/utils/is-dev';
import { t } from '@lingui/macro';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';

import {
  Accordion,
  BellIcon,
  Box,
  Button,
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
        <SettingsList>
          <SettingsListItem
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
          />
          <Divider />
          <SettingsListItem
            title={t({
              id: 'settings.display.cell_title',
              message: 'Display',
            })}
            caption={t({
              id: 'settings.display.cell_caption',
              message: 'Theme and account identifier',
            })}
            icon={<SquareLinesBottomIcon />}
            onPress={() => router.navigate(AppRoutes.SettingsDisplay)}
            testID={TestId.settingsDisplayButton}
          />
          <SettingsListItem
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
          />
          <SettingsListItem
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
          />
          {isDev() && (
            <SettingsListItem
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
            />
          )}
          <SettingsListItem
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
          />
        </SettingsList>
        <Accordion
          label={t({
            id: 'settings.accordion_label',
            message: 'More options',
          })}
          testID={TestId.settingsMoreOptionsButton}
          content={
            <SettingsList>
              <SettingsListItem
                title={t({
                  id: 'settings.contacts.cell_title',
                  message: 'Contacts',
                })}
                icon={<UsersTwoIcon />}
                onPress={() => {
                  contactsSheetRef.current?.present();
                }}
                testID={TestId.settingsContactsButton}
              />
              <SettingsListItem
                title={t({
                  id: 'settings.fees.cell_title',
                  message: 'Fees',
                })}
                icon={<SettingsGearIcon />}
                onPress={() => {
                  feesSheetRef.current?.present();
                }}
                testID={TestId.settingsFeesButton}
              />
            </SettingsList>
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
      <NotifyUserSheetLayout
        sheetData={{
          title: t({
            id: 'contacts.header_title',
            message: 'Contacts',
          }),
          id: WaitlistIds.contacts,
        }}
        sheetRef={contactsSheetRef}
      />
      <NotifyUserSheetLayout
        sheetData={{
          title: t({
            id: 'fees.header_title',
            message: 'Custom fees',
          }),
          id: WaitlistIds.fees,
        }}
        sheetRef={feesSheetRef}
      />
    </>
  );
}
