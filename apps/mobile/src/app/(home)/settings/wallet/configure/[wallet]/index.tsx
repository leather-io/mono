import { useRef, useState } from 'react';

import { AddWalletSheet } from '@/components/add-wallet/';
import { Divider } from '@/components/divider';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { NotifyUserSheet, NotifyUserSheetData } from '@/components/sheets/notify-user-sheet.layout';
import { useToastContext } from '@/components/toast/toast-context';
import { RemoveWalletSheet } from '@/components/wallet-settings/remove-wallet-sheet';
import { WalletNameSheet } from '@/components/wallet-settings/wallet-name-sheet';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { userRemovesWallet } from '@/store/global-action';
import { useSettings } from '@/store/settings/settings';
import { useAppDispatch } from '@/store/utils';
import { WalletStore } from '@/store/wallets/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { userRenamesWallet } from '@/store/wallets/wallets.write';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import dayjs from 'dayjs';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';

import {
  Accordion,
  ArrowOutOfBoxIcon,
  ArrowsRepeatLeftRightIcon,
  BarcodeIcon,
  Box,
  Cell,
  Eye1ClosedIcon,
  InboxIcon,
  SheetRef,
  SquareLinesBottomIcon,
  Text,
  Theme,
  TrashIcon,
} from '@leather.io/ui/native';

interface ConfigureWalletProps {
  wallet: WalletStore;
}
function ConfigureWallet({ wallet }: ConfigureWalletProps) {
  const theme = useTheme<Theme>();
  const router = useRouter();
  const addWalletSheetRef = useRef<SheetRef>(null);
  const walletNameSheetRef = useRef<SheetRef>(null);
  const removeWalletSheetRef = useRef<SheetRef>(null);
  const dispatch = useAppDispatch();
  const { securityLevelPreference } = useSettings();

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
      const result = await LocalAuthentication.authenticateAsync();
      if (result.success) {
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

  const addressReuseTitle = t({
    id: 'configure_wallet.address_reuse.cell_title',
    message: 'Address reuse',
  });
  const addressScanRangeTitle = t({
    id: 'configure_wallet.address_scan_range.cell_title',
    message: 'Address scan range',
  });
  const addressTypesTitle = t({
    id: 'configure_wallet.address_types.cell_title',
    message: 'Address types',
  });
  const exportXpubTitle = t({
    id: 'configure_wallet.export_xpub.cell_title',
    message: 'Export xPub',
  });
  const exportKeyTitle = t({
    id: 'configure_wallet.export_key.cell_title',
    message: 'Export key',
  });

  return (
    <>
      <AnimatedHeaderScreenLayout
        title={t({
          id: 'configure_wallet.header_title',
          message: 'Configure wallet',
        })}
      >
        <Box gap="3">
          <Text variant="heading05">{wallet.name}</Text>
          <Cell.Root
            title={t({
              id: 'configure_wallet.view_key.cell_title',
              message: 'View Secret Key',
            })}
            icon={<Eye1ClosedIcon />}
            onPress={() => {
              router.navigate({
                pathname: AppRoutes.SettingsWalletConfigureViewSecretKey,
                params: { fingerprint: wallet.fingerprint },
              });
            }}
            testID={TestId.walletSettingsViewSecretKeyButton}
          >
            <Cell.Chevron />
          </Cell.Root>
          <Cell.Root
            title={t({
              id: 'configure_wallet.rename_wallet.cell_title',
              message: 'Rename wallet',
            })}
            icon={<SquareLinesBottomIcon />}
            onPress={() => {
              walletNameSheetRef.current?.present();
            }}
            testID={TestId.walletSettingsRenameWalletButton}
          >
            <Cell.Chevron />
          </Cell.Root>
          <Cell.Root
            title={t({
              id: 'configure_wallet.remove_wallet.cell_title',
              message: 'Remove wallet',
            })}
            icon={<TrashIcon color={theme.colors['red.action-primary-default']} />}
            onPress={() => {
              removeWalletSheetRef.current?.present();
            }}
            testID={TestId.walletSettingsRemoveWalletButton}
          >
            <Cell.Chevron />
          </Cell.Root>
          <Accordion
            label={t({
              id: 'configure_wallet.accordion_label',
              message: 'More options',
            })}
            content={
              <>
                <Cell.Root
                  title={addressReuseTitle}
                  icon={<ArrowsRepeatLeftRightIcon color={theme.colors['ink.text-subdued']} />}
                  onPress={onOpenSheet({
                    title: addressReuseTitle,
                  })}
                >
                  <Cell.Chevron />
                </Cell.Root>
                <Cell.Root
                  title={addressScanRangeTitle}
                  icon={<BarcodeIcon color={theme.colors['ink.text-subdued']} />}
                  onPress={onOpenSheet({
                    title: addressScanRangeTitle,
                  })}
                >
                  <Cell.Chevron />
                </Cell.Root>
                <Cell.Root
                  title={addressTypesTitle}
                  icon={<InboxIcon color={theme.colors['ink.text-subdued']} />}
                  onPress={onOpenSheet({
                    title: addressTypesTitle,
                  })}
                >
                  <Cell.Chevron />
                </Cell.Root>
                <Cell.Root
                  title={exportXpubTitle}
                  icon={<ArrowOutOfBoxIcon color={theme.colors['ink.text-subdued']} />}
                  onPress={onOpenSheet({
                    title: exportXpubTitle,
                  })}
                >
                  <Cell.Chevron />
                </Cell.Root>
                <Cell.Root
                  title={exportKeyTitle}
                  icon={<ArrowOutOfBoxIcon color={theme.colors['ink.text-subdued']} />}
                  onPress={onOpenSheet({
                    title: exportKeyTitle,
                  })}
                >
                  <Cell.Chevron />
                </Cell.Root>
              </>
            }
          />
        </Box>
        <Box mb="7">
          <Divider />
          <Box py="5">
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
      </AnimatedHeaderScreenLayout>
      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
      <WalletNameSheet sheetRef={walletNameSheetRef} name={wallet.name} setName={setName} />
      <RemoveWalletSheet onSubmit={onRemoveWallet} sheetRef={removeWalletSheetRef} />
      <NotifyUserSheet sheetData={notifySheetData} sheetRef={notifySheetRef} />
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
