import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddWalletModal } from '@/components/add-wallet/add-wallet-modal';
import { Divider } from '@/components/divider';
import { RemoveWalletModal } from '@/components/wallet-settings/remove-wallet-modal';
import { WalletNameModal } from '@/components/wallet-settings/wallet-name-modal';
import { APP_ROUTES } from '@/constants';
import { userRemovesWallet } from '@/state/global-action';
import { useAppDispatch } from '@/state/utils';
import {
  WalletStore,
  useWalletByFingerprint,
  userRenamesWallet,
} from '@/state/wallets/wallets.slice';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import moment from 'moment';

import {
  ArrowOutOfBoxIcon,
  ArrowsRepeatLeftRightIcon,
  BarcodeIcon,
  Box,
  Cell,
  ChevronDownIcon,
  ChevronUpIcon,
  Eye1ClosedIcon,
  InboxIcon,
  SquareLinesBottomIcon,
  Text,
  Theme,
  TouchableOpacity,
  TrashIcon,
} from '@leather.io/ui/native';

function ConfigureWallet({ fingerprint, wallet }: { fingerprint: string; wallet: WalletStore }) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();
  const addWalletModalRef = useRef<BottomSheetModal>(null);
  const walletNameModalRef = useRef<BottomSheetModal>(null);
  const removeWalletModalRef = useRef<BottomSheetModal>(null);
  const [showMore, setShowMore] = useState(false);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  useEffect(() => {
    navigation.setOptions({ title: wallet.name });
  }, []);

  function setName(name: string) {
    dispatch(
      userRenamesWallet({
        fingerprint,
        name,
      })
    );
    navigation.setOptions({ title: name });
  }

  function removeWallet() {
    router.back();
    dispatch(userRemovesWallet({ fingerprint }));
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
                  params: { wallet: fingerprint },
                });
              }}
            />
            <Cell
              title={t`Rename wallet`}
              Icon={SquareLinesBottomIcon}
              onPress={() => {
                walletNameModalRef.current?.present();
              }}
            />
            <Cell
              title={t`Remove wallet`}
              Icon={TrashIcon}
              onPress={() => {
                removeWalletModalRef.current?.present();
              }}
              variant="critical"
            />
            <TouchableOpacity
              onPress={() => setShowMore(!showMore)}
              flexDirection="row"
              justifyContent="space-between"
            >
              <Text variant="label02">{t`Advanced options`}</Text>
              {showMore ? (
                <ChevronUpIcon color={theme.colors['ink.text-primary']} variant="small" />
              ) : (
                <ChevronDownIcon color={theme.colors['ink.text-primary']} variant="small" />
              )}
            </TouchableOpacity>
            {showMore && (
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
            )}
          </Box>
        </ScrollView>
        <Box mb="7">
          <Divider />
          <Box px="5" pt="5" style={{ paddingBottom: theme.spacing['5'] + bottom }}>
            <Text variant="caption01">{t`Creation date`}</Text>
            <Text variant="caption01" color="ink.text-subdued">
              {moment(wallet.createdOn).format('D MMM YYYY')}
            </Text>
          </Box>
        </Box>
      </Box>
      <AddWalletModal addWalletModalRef={addWalletModalRef} />
      <WalletNameModal modalRef={walletNameModalRef} name={wallet.name} setName={setName} />
      <RemoveWalletModal onSubmit={removeWallet} modalRef={removeWalletModalRef} />
    </>
  );
}

export default function ConfigureWalletScreen() {
  const params = useLocalSearchParams();

  if (!params.wallet || typeof params.wallet !== 'string') {
    throw new Error('No wallet fingerprint is passed in parameters');
  }
  const wallet = useWalletByFingerprint(params.wallet);
  if (!wallet) {
    throw new Error('No wallet is found');
  }
  return <ConfigureWallet fingerprint={params.wallet} wallet={wallet} />;
}
