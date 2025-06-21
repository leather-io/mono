import { useRef } from 'react';

import { Divider } from '@/components/divider';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { NotifyUserSheetLayout } from '@/components/sheets/notify-user-sheet.layout';
import { useAuthContext } from '@/components/splash-screen-guard/use-auth-context';
import { useToastContext } from '@/components/toast/toast-context';
import { useNotificationsFlag, useWaitlistFlag } from '@/features/feature-flags';
import SettingsLayout from '@/features/settings/settings-layout';
import { WaitlistIds } from '@/features/waitlist/ids';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useDeviceId } from '@/hooks/use-device-id';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';

import {
  Accordion,
  BellIcon,
  Box,
  Button,
  CopyIcon,
  GlobeTiltedIcon,
  Pressable,
  SettingsGearIcon,
  SheetRef,
  ShieldIcon,
  SquareLinesBottomIcon,
  SupportIcon,
  Text,
  UsersTwoIcon,
  WalletIcon,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

export default function SettingsScreen() {
  const contactsSheetRef = useRef<SheetRef>(null);
  const feesSheetRef = useRef<SheetRef>(null);
  const router = useRouter();
  const { lockApp } = useAuthContext();
  const { displayToast } = useToastContext();
  const deviceId = useDeviceId();
  const { onCopy: onDeviceIdCopy } = useCopyToClipboard(deviceId ?? '');
  const releasePushNotifications = useNotificationsFlag();
  const releaseWaitlistFeatures = useWaitlistFlag();
  function handleCopyDeviceIdToClipboard() {
    void onDeviceIdCopy();
    displayToast({
      title: t({
        id: 'settings.device_id.toast_title',
        message: 'ID copied to clipboard',
      }),
      type: 'success',
    });
  }

  return (
    <SettingsLayout title={t({ id: 'settings.header_title', message: 'Settings' })}>
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
          onPress={() => router.navigate('/settings/wallet')}
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
          onPress={() => router.navigate('/settings/display')}
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
          onPress={() => router.navigate('/settings/security')}
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
          onPress={() => router.navigate('/settings/networks')}
          testID={TestId.settingsNetworkButton}
        />
        {releasePushNotifications && (
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
            onPress={() => router.navigate('/settings/notifications')}
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
          onPress={() => router.navigate('/settings/help')}
          testID={TestId.settingsHelpButton}
        />
      </SettingsList>

      <Box px="5" gap="3" mt="5">
        {releaseWaitlistFeatures && (
          <Accordion
            label={t({
              id: 'settings.accordion_label',
              message: 'More options',
            })}
            testID={TestId.settingsMoreOptionsButton}
            content={
              <SettingsList mx="-5">
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
        )}

        <Box>
          <Text variant="label02">
            {t({
              id: 'settings.version_label',
              message: 'Version',
            })}
          </Text>
          <Text variant="caption01" color="ink.text-subdued">
            {Application.nativeApplicationVersion} / {Application.nativeBuildVersion}
          </Text>
        </Box>

        {deviceId && (
          <Box>
            <Text variant="label02">
              {t({
                id: 'settings.device_id_label',
                message: 'Device ID',
              })}
            </Text>
            <Pressable
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              onPress={handleCopyDeviceIdToClipboard}
              pressEffects={legacyTouchablePressEffect}
            >
              <Text variant="caption01" color="ink.text-subdued">
                {deviceId}
              </Text>
              <CopyIcon variant="small" style={{ marginTop: -2 }} />
            </Pressable>
          </Box>
        )}

        <Divider my="3" />

        <Button
          onPress={lockApp}
          buttonState="outline"
          title={t({
            id: 'settings.lock_button',
            message: 'Lock app',
          })}
          testID={TestId.settingsLockAppButton}
        />
      </Box>

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
    </SettingsLayout>
  );
}
