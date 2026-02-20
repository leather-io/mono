import { ScrollView } from 'react-native';

import { Screen } from '@/components/screen/screen';
import { WalletList } from '@/features/wallet-manager';
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
          <WalletList />
        </Box>
      </ScrollView>
    </Screen>
  );
}
