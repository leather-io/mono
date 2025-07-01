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
import { userRemovesWallet } from '@/store/global-action';
import { useSettings } from '@/store/settings/settings';
import { useAppDispatch } from '@/store/utils';
import { WalletStore } from '@/store/wallets/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { userRenamesWallet } from '@/store/wallets/wallets.write';
import { t } from '@lingui/macro';
import dayjs from 'dayjs';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';

import {
  Accordion,
  ArrowOutOfBoxIcon,
  ArrowsRepeatLeftRightIcon,
  BarcodeIcon,
  Box,
  Eye1ClosedIcon,
  InboxIcon,
  SheetRef,
  SquareLinesBottomIcon,
  Text,
  Theme,
  TrashIcon,
} from '@leather.io/ui/native';

function getUnavailableFeatures({ iconColor }: { iconColor: keyof Theme['colors'] }) {
  return {
    addressReuse: {
      title: t({
        id: 'configure_wallet.address_reuse.cell_title',
        message: 'Address reuse',
      }),
      icon: <ArrowsRepeatLeftRightIcon color={iconColor} />,
      id: WaitlistIds.addressReuse,
    },
    addressScanRange: {
      title: t({
        id: 'configure_wallet.address_scan_range.cell_title',
        message: 'Address scan range',
      }),
      icon: <BarcodeIcon color={iconColor} />,
      id: WaitlistIds.capsule,
    },
    addressTypes: {
      title: t({
        id: 'configure_wallet.address_types.cell_title',
        message: 'Address types',
      }),
      icon: <InboxIcon color={iconColor} />,
      id: WaitlistIds.addressTypes,
    },
    exportXpub: {
      title: t({
        id: 'configure_wallet.export_xpub.cell_title',
        message: 'Export xPub',
      }),
      icon: <ArrowOutOfBoxIcon color={iconColor} />,
      id: WaitlistIds.exportXpub,
    },
    exportKey: {
      title: t({
        id: 'configure_wallet.export_key.cell_title',
        message: 'Export key',
      }),
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
  const walletNameSheetRef = useRef<SheetRef>(null);
  const removeWalletSheetRef = useRef<SheetRef>(null);
  const dispatch = useAppDispatch();
  const { securityLevelPreference } = useSettings();
  const { authenticate } = useAuthentication();
  const releaseWaitlistFeatures = useWaitlistFlag();
  const { displayToast } = useToastContext();

  function setName(name: string) {
    if (name === '') {
      displayToast({
        title: t({
          id: 'configure_wallet.wallet_name.empty_name_error',
          message: 'Wallet name cannot be empty',
        }),
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
    dispatch(userRemovesWallet({ fingerprint: wallet.fingerprint }));
  }

  async function secureRemoveWallet() {
    if (securityLevelPreference === 'secure') {
      const result = await authenticate();
      if (result && result.success) {
        removeWallet();
      } else {
        displayToast({
          title: t({
            id: 'configure_wallet.delete_wallet.authentication_failed',
            message: 'Authentication failed',
          }),
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

  const notifySheetRef = useRef<SheetRef>(null);
  const [notifySheetData, setNotifySheetData] = useState<NotifyUserSheetData | null>(null);

  function onOpenSheet(option: NotifyUserSheetData) {
    return () => {
      setNotifySheetData(option);
      notifySheetRef.current?.present();
    };
  }

  return (
    <>
      <SettingsLayout
        title={t({
          id: 'configure_wallet.header_title',
          message: 'Configure wallet',
        })}
      >
        <Box px="5" py="2">
          <Text variant="heading05">{wallet.name}</Text>
        </Box>
        <Box gap="3">
          <SettingsList gap="1">
            <SettingsListItem
              title={t({
                id: 'configure_wallet.view_key.cell_title',
                message: 'View Secret Key',
              })}
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
              title={t({
                id: 'configure_wallet.rename_wallet.cell_title',
                message: 'Rename wallet',
              })}
              icon={<SquareLinesBottomIcon />}
              onPress={() => {
                walletNameSheetRef.current?.present();
              }}
              testID={TestId.walletSettingsRenameWalletButton}
            />
            <SettingsListItem
              title={t({
                id: 'configure_wallet.remove_wallet.cell_title',
                message: 'Remove wallet',
              })}
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
                label={t({
                  id: 'configure_wallet.accordion_label',
                  message: 'Advanced options',
                })}
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
            <Text variant="caption01">
              {t({
                id: 'configure_wallet.creation_label',
                message: 'Creation date',
              })}
            </Text>
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
