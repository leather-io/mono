import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletSheet } from '@/components/add-wallet/';
import { Divider } from '@/components/divider';
import { RemoveWalletSheet } from '@/components/wallet-settings/remove-wallet-sheet';
import { WalletNameSheet } from '@/components/wallet-settings/wallet-name-sheet';
import { APP_ROUTES } from '@/routes';
import { userRemovesWallet } from '@/store/global-action';
import { useAppDispatch } from '@/store/utils';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { WalletStore, userRenamesWallet } from '@/store/wallets/wallets.write';
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
  }, []);

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
            <Cell
              title={t`View Secret Key`}
              Icon={Eye1ClosedIcon}
              onPress={() => {
                router.navigate({
                  pathname: APP_ROUTES.WalletWalletsSettingsConfigureViewSecretKey,
                  params: { fingerprint: wallet.fingerprint },
                });
              }}
            />
            <Cell
              title={t`Rename wallet`}
              Icon={SquareLinesBottomIcon}
              onPress={() => {
                walletNameSheetRef.current?.present();
              }}
            />
            <Cell
              title={t`Remove wallet`}
              Icon={TrashIcon}
              onPress={() => {
                removeWalletSheetRef.current?.present();
              }}
              variant="critical"
            />
            <Accordion
              label={t`Advanced options`}
              content={
                <>
                  <Cell
                    title={t`Address reuse`}
                    Icon={ArrowsRepeatLeftRightIcon}
                    variant="inactive"
                  />
                  <Cell title={t`Address scan range`} Icon={BarcodeIcon} variant="inactive" />
                  <Cell title={t`Address types`} Icon={InboxIcon} variant="inactive" />
                  <Cell title={t`Export xPub`} Icon={ArrowOutOfBoxIcon} variant="inactive" />
                  <Cell title={t`Export key`} Icon={ArrowOutOfBoxIcon} variant="inactive" />
                </>
              }
            />
          </Box>
        </ScrollView>
        <Box mb="7">
          <Divider />
          <Box px="5" pt="5" style={{ paddingBottom: theme.spacing['5'] + bottom }}>
            <Text variant="caption01">{t`Creation date`}</Text>
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
