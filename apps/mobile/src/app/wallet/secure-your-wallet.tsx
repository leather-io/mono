import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CircleQuestionMark from '@/assets/circle-questionmark.svg';
import Lock from '@/assets/lock.svg';
import { Button } from '@/components/button';
import { SkipSecureWalletModal } from '@/components/secure-your-wallet/skip-secure-wallet-modal';
import { useToastContext } from '@/components/toast/toast-context';
import { APP_ROUTES } from '@/constants';
import { useKeyStore } from '@/state/key-store';
import { tempMnemonicStore } from '@/state/storage-persistors';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import { Box, Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

export default function () {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const skipSecureWalletModalRef = useRef<BottomSheetModal>(null);
  const router = useRouter();
  const toastContext = useToastContext();
  const keyStore = useKeyStore();

  async function createWallet(biometrics: boolean) {
    const { mnemonic, passphrase } = await tempMnemonicStore.getTemporaryMnemonic();
    if (mnemonic) {
      await keyStore.restoreWalletFromMnemonic({
        mnemonic,
        biometrics,
        passphrase: passphrase ?? undefined,
      });
      toastContext.displayToast({ type: 'success', title: t`Wallet added successfully` });
    }
  }

  return (
    <>
      <Box
        flex={1}
        backgroundColor="ink.background-primary"
        px="5"
        justifyContent="space-between"
        style={{ paddingBottom: bottom + theme.spacing['5'] }}
      >
        <Box gap="3" pt="5">
          <TouchableOpacity
            onPress={() => {
              // TODO: show some kind of a helper here
            }}
            p="5"
            position="absolute"
            right={-theme.spacing['5']}
            zIndex={10}
            top={theme.spacing['1']}
          >
            <CircleQuestionMark height={16} width={16} color={theme.colors['ink.text-primary']} />
          </TouchableOpacity>
          <Text variant="heading03">{t`SECURE YOUR WALLET`}</Text>
          <Text variant="label01">
            {t`Use your device’s PIN, Face ID, or other biometrics for quick and secure access.`}
          </Text>
        </Box>
        <Box justifyContent="center" alignItems="center">
          <Lock height={204} width={204} color={theme.colors['ink.text-primary']} />
        </Box>
        <Box>
          <Button
            onPress={async () => {
              skipSecureWalletModalRef.current?.present();
            }}
            pb="4"
            buttonState="ghost"
            title={t`Skip for now`}
          />
          <Button
            onPress={async () => {
              // TODO: set high security level
              await createWallet(true);
              router.navigate(APP_ROUTES.WalletHome);
            }}
            buttonState="default"
            title={t`Enable device security`}
          />
        </Box>
      </Box>
      <SkipSecureWalletModal
        onSkip={async () => {
          // TODO: set low security level
          await createWallet(false);
          router.navigate(APP_ROUTES.WalletHome);
        }}
        skipSecureWalletModalRef={skipSecureWalletModalRef}
      />
    </>
  );
}
