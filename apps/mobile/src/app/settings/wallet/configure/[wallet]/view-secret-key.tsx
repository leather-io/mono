import { Screen } from '@/components/screen/screen';
import SettingsLayout from '@/features/settings/settings-layout';
import { MnemonicDisplay } from '@/features/wallet-manager/create-new-wallet/mnemonic-display';
import { useMnemonic } from '@/store/storage-persistors';
import { t } from '@lingui/core/macro';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Box, Button, Text } from '@leather.io/ui/native';

function ViewSecretKey({ fingerprint }: { fingerprint: string }) {
  const router = useRouter();
  const { mnemonic, passphrase } = useMnemonic({ fingerprint });

  if (!mnemonic) return <Box flex={1} backgroundColor="ink.background-primary" />;

  return (
    <>
      <SettingsLayout title={t`Your Secret Key`}>
        <Box gap="5" px="5" pb="8">
          <Text variant="label01">
            {t`Your Secret Key grants you access to your wallet and its assets. Store it securely since it can never be recovered if lost or stolen.`}
          </Text>

          <MnemonicDisplay mnemonic={mnemonic} passphrase={passphrase} />
        </Box>
      </SettingsLayout>
      <Screen.Footer>
        <Button onPress={() => router.back()}>{t`Done`}</Button>
      </Screen.Footer>
    </>
  );
}

export default function ViewSecretKeyScreen() {
  const params = useLocalSearchParams();
  if (!params.fingerprint || typeof params.fingerprint !== 'string') {
    throw new Error('No fingerprint is passed to ViewSecretKeyScreen');
  }
  return <ViewSecretKey fingerprint={params.fingerprint} />;
}
