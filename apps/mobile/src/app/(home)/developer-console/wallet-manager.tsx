import { useState } from 'react';
import { Button, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WalletList } from '@/components/wallet-manager';
import { TestId } from '@/shared/test-id';
import { useKeyStore } from '@/store/key-store';
import { useSettings } from '@/store/settings/settings';
import { clearAllPersistedStorage } from '@/store/utils';
import { useWallets } from '@/store/wallets/wallets.read';
import { nextAnimationFrame } from '@/utils/next-animation-frame';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

export default function WalletManager() {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const keys = useKeyStore();
  const wallets = useWallets();
  const settings = useSettings();
  const [generatingWallet, setGeneratingWallet] = useState(false);
  return (
    <Box flex={1} backgroundColor="ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing['3'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Button
            title={t`Clear`}
            onPress={() => clearAllPersistedStorage(wallets.list.map(wallet => wallet.fingerprint))}
            testID={TestId.walletManagementClearButton}
          />
          <Button
            title={generatingWallet ? t`Generating…` : t`Create wallet`}
            onPress={async () => {
              setGeneratingWallet(true);
              await nextAnimationFrame();
              await keys.createNewSoftwareWallet();
              setGeneratingWallet(false);
            }}
          />
          <Button title={t`Toggle network`} onPress={() => settings.toggleNetwork()} />
        </View>
        <WalletList />
      </ScrollView>
    </Box>
  );
}
