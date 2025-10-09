import { useRef, useState } from 'react';

import { Divider } from '@/components/divider';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import {
  NotifyUserSheetData,
  NotifyUserSheetLayout,
} from '@/components/sheets/notify-user-sheet.layout';
import { useToastContext } from '@/components/toast/toast-context';
import { useWaitlistFlag } from '@/features/feature-flags';
import SettingsLayout from '@/features/settings/settings-layout';
import { RemoveWalletSheet } from '@/features/settings/wallet-and-accounts/remove-wallet-sheet';
import { WalletNameSheet } from '@/features/settings/wallet-and-accounts/wallet-name-sheet';
import { WaitlistIds } from '@/features/waitlist/ids';
import { useAuthentication } from '@/hooks/use-authentication';
import { TestId } from '@/shared/test-id';
import { useSettings } from '@/store/settings/settings';
import { useAppDispatch } from '@/store/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { t } from '@lingui/core/macro';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';

import { WalletStore, userRemovesWallet, userRenamesWallet } from '@leather.io/state/wallet';
import {
  Accordion,
  ArrowOutOfBoxIcon,
  ArrowsRepeatLeftRightIcon,
  BarcodeIcon,
  Box,
  Eye1ClosedIcon,
  InboxIcon,
  SheetInstance,
  SquareLinesBottomIcon,
  Text,
  Theme,
  TrashIcon,
} from '@leather.io/ui/native';

function getUnavailableFeatures({ iconColor }: { iconColor: keyof Theme['colors'] }) {
  return {
    addressReuse: {
      title: t`Address reuse`,
      icon: <ArrowsRepeatLeftRightIcon color={iconColor} />,
      id: WaitlistIds.addressReuse,
    },
    addressScanRange: {
      title: t`Address scan range`,
      icon: <BarcodeIcon color={iconColor} />,
      id: WaitlistIds.capsule,
    },
    addressTypes: {
      title: t`Address types`,
      icon: <InboxIcon color={iconColor} />,
      id: WaitlistIds.addressTypes,
    },
    exportXpub: {
      title: t`Export xPub`,
      icon: <ArrowOutOfBoxIcon color={iconColor} />,
      id: WaitlistIds.exportXpub,
    },
    exportKey: {
      title: t`Export key`,
      icon: <ArrowOutOfBoxIcon color={iconColor} />,
      id: WaitlistIds.exportKey,
    },
  };
}

interface ConfigureWalletProps {
  wallet: WalletStore;
}
function ConfigureWallet({ wallet }: ConfigureWalletProps) {
  const router = useRouter();
  const walletNameSheetRef = useRef<SheetInstance>(null);
  const removeWalletSheetRef = useRef<SheetInstance>(null);
  const dispatch = useAppDispatch();
  const { securityLevelPreference, currentAccount, changeCurrentAccount } = useSettings();
  const { authenticate } = useAuthentication();
  const releaseWaitlistFeatures = useWaitlistFlag();
  const { displayToast } = useToastContext();

  function setName(name: string) {
    if (name === '') {
      displayToast({
        title: t`Wallet name cannot be empty`,
        type: 'error',
      });
      return { success: false };
    }
    dispatch(
      userRenamesWallet({
        fingerprint: wallet.fingerprint,
        name,
      })
    );
    return { success: true };
  }

  function removeWallet() {
    router.back();
    if (currentAccount?.fingerprint === wallet.fingerprint) {
      changeCurrentAccount(null);
    }
    dispatch(userRemovesWallet({ fingerprint: wallet.fingerprint }));
  }

  async function secureRemoveWallet() {
    if (securityLevelPreference === 'secure') {
      const result = await authenticate();
      if (result && result.success) {
        removeWallet();
      } else {
        displayToast({
          title: t`Authentication failed`,
          type: 'error',
        });
      }
    }
  }

  async function onRemoveWallet() {
    if (securityLevelPreference === 'secure') {
      await secureRemoveWallet();
      return;
    }
    removeWallet();
  }

  const notifySheetRef = useRef<SheetInstance>(null);
  const [notifySheetData, setNotifySheetData] = useState<NotifyUserSheetData | null>(null);

  function onOpenSheet(option: NotifyUserSheetData) {
    return () => {
      setNotifySheetData(option);
      notifySheetRef.current?.present();
    };
  }

  return (
    <>
      <SettingsLayout title={t`Configure\nwallet`}>
        <Box px="5" py="2">
          <Text variant="heading05">{wallet.name}</Text>
        </Box>
        <Box gap="3">
          <SettingsList gap="1">
            <SettingsListItem
              title={t`View Secret Key`}
              icon={<Eye1ClosedIcon />}
              onPress={() => {
                router.navigate({
                  pathname: '/settings/wallet/configure/[wallet]/view-secret-key',
                  params: { fingerprint: wallet.fingerprint, wallet: wallet.fingerprint },
                });
              }}
              testID={TestId.walletSettingsViewSecretKeyButton}
            />
            <SettingsListItem
              title={t`Rename wallet`}
              icon={<SquareLinesBottomIcon />}
              onPress={() => {
                walletNameSheetRef.current?.present();
              }}
              testID={TestId.walletSettingsRenameWalletButton}
            />
            <SettingsListItem
              title={t`Remove wallet`}
              icon={<TrashIcon color="red.action-primary-default" />}
              onPress={() => {
                removeWalletSheetRef.current?.present();
              }}
              testID={TestId.walletSettingsRemoveWalletButton}
            />
          </SettingsList>
          {releaseWaitlistFeatures && (
            <Box px="5">
              <Accordion
                label={t`Advanced options`}
                content={
                  <SettingsList mx="-5">
                    {Object.values(getUnavailableFeatures({ iconColor: 'ink.text-subdued' })).map(
                      feature => (
                        <SettingsListItem
                          key={feature.id}
                          title={feature.title}
                          icon={feature.icon}
                          onPress={onOpenSheet({
                            title: feature.title,
                            id: feature.id,
                          })}
                        />
                      )
                    )}
                  </SettingsList>
                }
              />
            </Box>
          )}

          <Divider />

          <Box py="3" px="5">
            <Text variant="caption01">{t`Creation date`}</Text>
            <Text variant="caption01" color="ink.text-subdued">
              {dayjs(wallet.createdOn).format('D MMM YYYY')}
            </Text>
          </Box>
        </Box>
      </SettingsLayout>
      <WalletNameSheet sheetRef={walletNameSheetRef} name={wallet.name} setName={setName} />
      <RemoveWalletSheet onSubmit={onRemoveWallet} sheetRef={removeWalletSheetRef} />
      <NotifyUserSheetLayout sheetData={notifySheetData} sheetRef={notifySheetRef} />
    </>
  );
}

const configureWalletParamsSchema = z.object({ fingerprint: z.string() });

export default function ConfigureWalletScreen() {
  const params = useLocalSearchParams();
  const { fingerprint } = configureWalletParamsSchema.parse(params);

  return (
    <WalletLoader fingerprint={fingerprint}>
      {wallet => <ConfigureWallet wallet={wallet} />}
    </WalletLoader>
  );
}
