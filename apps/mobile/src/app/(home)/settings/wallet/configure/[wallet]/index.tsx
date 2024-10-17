import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletSheet } from '@/components/add-wallet/';
import { Divider } from '@/components/divider';
import { RemoveWalletSheet } from '@/components/wallet-settings/remove-wallet-sheet';
import { WalletNameSheet } from '@/components/wallet-settings/wallet-name-sheet';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { userRemovesWallet } from '@/store/global-action';
import { useAppDispatch } from '@/store/utils';
import { WalletStore } from '@/store/wallets/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { userRenamesWallet } from '@/store/wallets/wallets.write';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import dayjs from 'dayjs';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();
  const addWalletSheetRef = useRef<SheetRef>(null);
  const walletNameSheetRef = useRef<SheetRef>(null);
  const removeWalletSheetRef = useRef<SheetRef>(null);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    navigation.setOptions({ title: wallet.name });
  }, [navigation, wallet.name]);

  function setName(name: string) {
    dispatch(
      userRenamesWallet({
        fingerprint: wallet.fingerprint,
        name,
      })
    );
    navigation.setOptions({ title: name });
  }

  function removeWallet() {
    router.back();
    dispatch(userRemovesWallet({ fingerprint: wallet.fingerprint }));
  }

  return (
    <>
      <Box flex={1} justifyContent="space-between" backgroundColor="ink.background-primary">
        <ScrollView
          contentContainerStyle={{
            paddingTop: theme.spacing['5'],
            paddingBottom: theme.spacing['5'],
            gap: theme.spacing[5],
          }}
        >
          <Box px="5" gap="6">
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
                message: 'Advanced options',
              })}
              content={
                <>
                  <Cell.Root
                    title={t({
                      id: 'configure_wallet.address_reuse.cell_title',
                      message: 'Address reuse',
                    })}
                    icon={<ArrowsRepeatLeftRightIcon color={theme.colors['ink.text-subdued']} />}
                  >
                    <Cell.Chevron />
                  </Cell.Root>
                  <Cell.Root
                    title={t({
                      id: 'configure_wallet.address_scan_range.cell_title',
                      message: 'Address scan range',
                    })}
                    icon={<BarcodeIcon color={theme.colors['ink.text-subdued']} />}
                  >
                    <Cell.Chevron />
                  </Cell.Root>
                  <Cell.Root
                    title={t({
                      id: 'configure_wallet.address_types.cell_title',
                      message: 'Address types',
                    })}
                    icon={<InboxIcon color={theme.colors['ink.text-subdued']} />}
                  >
                    <Cell.Chevron />
                  </Cell.Root>
                  <Cell.Root
                    title={t({
                      id: 'configure_wallet.export_xpub.cell_title',
                      message: 'Export xPub',
                    })}
                    icon={<ArrowOutOfBoxIcon color={theme.colors['ink.text-subdued']} />}
                  >
                    <Cell.Chevron />
                  </Cell.Root>
                  <Cell.Root
                    title={t({
                      id: 'configure_wallet.export_key.cell_title',
                      message: 'Export key',
                    })}
                    icon={<ArrowOutOfBoxIcon color={theme.colors['ink.text-subdued']} />}
                  >
                    <Cell.Chevron />
                  </Cell.Root>
                </>
              }
            />
          </Box>
        </ScrollView>
        <Box mb="7">
          <Divider />
          <Box px="5" pt="5" style={{ paddingBottom: theme.spacing['5'] + bottom }}>
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
      </Box>
      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
      <WalletNameSheet sheetRef={walletNameSheetRef} name={wallet.name} setName={setName} />
      <RemoveWalletSheet onSubmit={removeWallet} sheetRef={removeWalletSheetRef} />
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
