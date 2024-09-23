import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SkipSecureWalletSheet } from '@/components/secure-your-wallet/skip-secure-wallet-sheet';
import { useCreateWallet } from '@/hooks/create-wallet';
import { Trans, t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import {
  Box,
  Button,
  LockIcon,
  QuestionCircleIcon,
  SheetRef,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

export default function SecureYourWalletScreen() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const sheetRef = useRef<SheetRef>(null);
  const { createWallet } = useCreateWallet();

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
            <QuestionCircleIcon variant="small" />
          </TouchableOpacity>
          <Box>
            <Trans>
              <Text variant="heading03">SECURE</Text>
              <Text variant="heading03">YOUR WALLET</Text>
            </Trans>
          </Box>
          <Text variant="label01">
            {t`Use your device’s PIN, Face ID, or other biometrics for quick and secure access.`}
          </Text>
        </Box>
        <Box justifyContent="center" alignItems="center">
          <LockIcon height={204} width={204} />
        </Box>
        <Box>
          <Button
            onPress={async () => {
              sheetRef.current?.present();
            }}
            pb="4"
            buttonState="ghost"
            title={t`Skip for now`}
          />
          <Button
            onPress={async () => {
              await createWallet({ biometrics: true });
            }}
            buttonState="default"
            title={t`Enable device security`}
          />
        </Box>
      </Box>
      <SkipSecureWalletSheet
        onSubmit={async () => {
          sheetRef.current?.close();
          await createWallet({ biometrics: false });
        }}
        sheetRef={sheetRef}
      />
    </>
  );
}
