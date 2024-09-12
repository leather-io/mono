import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MnemonicDisplay } from '@/components/create-new-wallet/mnemonic-display';
import { useMnemonic } from '@/store/storage-persistors';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  Box,
  Button,
  QuestionCircleIcon,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

function ViewSecretKey({ fingerprint }: { fingerprint: string }) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const router = useRouter();
  const { mnemonic, passphrase } = useMnemonic({ fingerprint });

  if (!mnemonic) {
    return null;
  }

  // TODO: get mnemonic key of wallet
  return (
    <Box
      flex={1}
      backgroundColor="ink.background-primary"
      justifyContent="space-between"
      style={{ paddingBottom: bottom + theme.spacing['5'] }}
    >
      <ScrollView style={{ paddingHorizontal: theme.spacing['5'] }}>
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
            <QuestionCircleIcon color={theme.colors['ink.text-primary']} variant="small" />
          </TouchableOpacity>
          <Text variant="heading03">{t`SECRET KEY`}</Text>
          <Text variant="label01">
            {t`Your Secret Key grants you access to your wallet and its assets.`}
          </Text>
        </Box>

        <Box my="5">
          <MnemonicDisplay mnemonic={mnemonic} passphrase={passphrase} />
        </Box>
      </ScrollView>
      <Box px="5" gap="4">
        <Button
          onPress={() => {
            router.back();
          }}
          buttonState="default"
          title={t`I've backed it up`}
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
