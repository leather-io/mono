import { ScrollView } from 'react-native';

import { Screen } from '@/components/screen/screen';
import { TestId } from '@/shared/test-id';
import { useKeyStore } from '@/store/key-store';
import { useSettings } from '@/store/settings/settings';
import { useWallets } from '@/store/wallets/wallets.read';
import { t } from '@lingui/core/macro';

import { Box, Button, Text } from '@leather.io/ui/native';

export default function DeveloperConsole() {
  const keyStore = useKeyStore();
  const wallets = useWallets();
  const { toggleNetwork } = useSettings();

  function onCreateWallet() {
    void keyStore.createNewSoftwareWallet();
  }

  function onClearWallets() {
    for (const wallet of wallets.list) {
      wallets.remove(wallet.fingerprint);
    }
  }

  return (
    <Screen>
      <Screen.Header centerElement={<Text variant="label02">{t`Developer Console`}</Text>} />
      <ScrollView>
        <Box p="5" gap="3">
          <Text variant="heading05">{t`Wallet Manager`}</Text>
          <Button onPress={onCreateWallet} testID={TestId.devConsoleCreateWalletButton}>
            {t`Create wallet`}
          </Button>
          <Button onPress={onClearWallets} testID={TestId.devConsoleClearWalletsButton}>
            {t`Clear wallets`}
          </Button>
          <Button onPress={toggleNetwork} testID={TestId.devConsoleToggleNetworkButton}>
            {t`Toggle network`}
          </Button>
          {/* eslint-disable lingui/no-unlocalized-strings */}
          <Text variant="heading05">{t`Environment`}</Text>
          <Text variant="caption01">{`__DEV__: ${String(__DEV__)}`}</Text>
          <Text variant="caption01">{`NODE_ENV: ${process.env.EXPO_PUBLIC_NODE_ENV ?? 'undefined'}`}</Text>
          <Text variant="caption01">{`LAUNCH_DARKLY: ${process.env.EXPO_PUBLIC_LAUNCH_DARKLY ? 'set' : 'unset'}`}</Text>
          <Text variant="caption01">{`SENTRY_DSN: ${process.env.EXPO_PUBLIC_SENTRY_DSN ? 'set' : 'unset'}`}</Text>
          <Text variant="caption01">{`MIXPANEL: ${process.env.EXPO_PUBLIC_MIXPANEL_TOKEN ? 'set' : 'unset'}`}</Text>
          <Text variant="caption01">{`MAESTRO_CI: ${process.env.EXPO_PUBLIC_MAESTRO_CI ?? 'undefined'}`}</Text>
          {/* eslint-enable lingui/no-unlocalized-strings */}
        </Box>
      </ScrollView>
    </Screen>
  );
}
