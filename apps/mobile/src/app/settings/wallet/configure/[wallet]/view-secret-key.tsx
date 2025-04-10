import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MnemonicDisplay } from '@/components/create-new-wallet/mnemonic-display';
import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { useMnemonic } from '@/store/storage-persistors';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Box, Button, Text, Theme } from '@leather.io/ui/native';

function ViewSecretKey({ fingerprint }: { fingerprint: string }) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { mnemonic, passphrase } = useMnemonic({ fingerprint });

  if (!mnemonic) return <Box flex={1} backgroundColor="ink.background-primary" />;

  const pageTitle = t({
    id: 'view_secret_key.title',
    message: 'SECRET KEY',
  });

  return (
    <Box bg="ink.background-primary" flex={1} style={{ paddingBottom: bottom + theme.spacing[5] }}>
      <AnimatedHeaderScreenLayout title={pageTitle} contentTitle={pageTitle}>
        <Box gap="3">
          <Text variant="label01">
            {t({
              id: 'view_secret_key.subtitle',
              message: 'Your Secret Key grants you access to your wallet and its assets.',
            })}
          </Text>
        </Box>

        <Box my="5">
          <MnemonicDisplay mnemonic={mnemonic} passphrase={passphrase} />
        </Box>
      </AnimatedHeaderScreenLayout>
      <Box px="5" gap="4">
        <Button
          onPress={() => {
            router.back();
          }}
          buttonState="default"
          title={t({
            id: 'view_secret_key.button',
            message: 'Done',
          })}
        />
      </Box>
    </Box>
  );
}

export default function ViewSecretKeyScreen() {
  const params = useLocalSearchParams();
  if (!params.fingerprint || typeof params.fingerprint !== 'string') {
    throw new Error('No fingerprint is passed to ViewSecretKeyScreen');
  }
  return <ViewSecretKey fingerprint={params.fingerprint} />;
}
