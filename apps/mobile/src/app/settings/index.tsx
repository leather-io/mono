import { useRef } from 'react';

import { Divider } from '@/components/divider';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import { NotifyUserSheetLayout } from '@/components/sheets/notify-user-sheet.layout';
import { useAuthContext } from '@/components/splash-screen-guard/use-auth-context';
import { useToastContext } from '@/components/toast/toast-context';
import { useNotificationsFlag, useWaitlistFlag } from '@/features/feature-flags';
import { AppIconPickerSheet } from '@/features/settings/choose-app-icon/app-icon-picker-sheet';
import SettingsLayout from '@/features/settings/settings-layout';
import { WaitlistIds } from '@/features/waitlist/ids';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useDeviceId } from '@/hooks/use-device-id';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/core/macro';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';

import {
  Accordion,
  AppIcon,
  BellIcon,
  Box,
  Button,
  CopyIcon,
  GlobeTiltedIcon,
  Pressable,
  SettingsGearIcon,
  SheetInstance,
  ShieldIcon,
  SquareLinesBottomIcon,
  SupportIcon,
  Text,
  UsersTwoIcon,
  WalletIcon,
} from '@leather.io/ui/native';

export default function SettingsScreen() {
  const contactsSheetRef = useRef<SheetInstance>(null);
  const feesSheetRef = useRef<SheetInstance>(null);
  const appIconSheetRef = useRef<SheetInstance>(null);
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
      title: t`ID copied to clipboard`,
      type: 'success',
    });
  }

  return (
    <SettingsLayout title={t`Settings`}>
      <SettingsList>
        <SettingsListItem
          title={t`Wallets and accounts`}
          caption={t`Add, configure and remove`}
          icon={<WalletIcon />}
          onPress={() => router.navigate('/settings/wallet')}
          testID={TestId.settingsWalletAndAccountsButton}
        />
        <Divider />
        <SettingsListItem
          title={t`Display`}
          caption={t`Theme and account identifier`}
          icon={<SquareLinesBottomIcon />}
          onPress={() => router.navigate('/settings/display')}
          testID={TestId.settingsDisplayButton}
        />
        <SettingsListItem
          title={t`Security`}
          caption={t`Analytics and app authentication`}
          icon={<ShieldIcon />}
          onPress={() => router.navigate('/settings/security')}
          testID={TestId.settingsSecurityButton}
        />
        <SettingsListItem
          title={t`Networks`}
          caption={t`Mainnet, testnet or signet`}
          icon={<GlobeTiltedIcon />}
          onPress={() => router.navigate('/settings/networks')}
          testID={TestId.settingsNetworkButton}
        />
        <SettingsListItem
          title={t`App Icon`}
          caption={t`Customize your app icon`}
          icon={<AppIcon />}
          onPress={() => appIconSheetRef.current?.present()}
        />
        {releasePushNotifications && (
          <SettingsListItem
            py="3"
            title={t`Notifications`}
            caption={t`Push and email notifications`}
            icon={<BellIcon />}
            onPress={() => router.navigate('/settings/notifications')}
            testID={TestId.settingsNotificationsButton}
          />
        )}
        <SettingsListItem
          title={t`Help`}
          caption={t`Get support or provide feedback`}
          icon={<SupportIcon />}
          onPress={() => router.navigate('/settings/help')}
          testID={TestId.settingsHelpButton}
        />
      </SettingsList>

      <Box px="5" gap="3" mt="5">
        {releaseWaitlistFeatures && (
          <Accordion
            label={t`More options`}
            testID={TestId.settingsMoreOptionsButton}
            content={
              <SettingsList mx="-5">
                <SettingsListItem
                  title={t`Contacts`}
                  icon={<UsersTwoIcon />}
                  onPress={() => {
                    contactsSheetRef.current?.present();
                  }}
                  testID={TestId.settingsContactsButton}
                />
                <SettingsListItem
                  title={t`Fees`}
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
          <Text variant="label02">{t`Version`}</Text>
          <Text variant="caption01" color="ink.text-subdued-primary">
            {Application.nativeApplicationVersion} / {Application.nativeBuildVersion}
          </Text>
        </Box>

        {deviceId && (
          <Box>
            <Text variant="label02">{t`Device ID`}</Text>
            <Pressable
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              onPress={handleCopyDeviceIdToClipboard}
            >
              <Text variant="caption01" color="ink.text-subdued-primary">
                {deviceId}
              </Text>
              <CopyIcon variant="small" style={{ marginTop: -2 }} />
            </Pressable>
          </Box>
        )}

        <Divider my="3" fullBleed />

        <Button onPress={lockApp} variant="outline" testID={TestId.settingsLockAppButton}>
          {t`Lock app`}
        </Button>
      </Box>

      <NotifyUserSheetLayout
        sheetData={{
          title: t`Contacts`,
          id: WaitlistIds.contacts,
        }}
        sheetRef={contactsSheetRef}
      />
      <NotifyUserSheetLayout
        sheetData={{
          title: t`Custom fees`,
          id: WaitlistIds.fees,
        }}
        sheetRef={feesSheetRef}
      />
      <AppIconPickerSheet sheetRef={appIconSheetRef} />
    </SettingsLayout>
  );
}
