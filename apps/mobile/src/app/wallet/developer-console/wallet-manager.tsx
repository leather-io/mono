import { useState } from 'react';
import { Button, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WalletList } from '@/components/wallet-manager';
import { useKeyStore } from '@/state/key-store';
import { useSettings } from '@/state/settings/settings.slice';
import { clearAllPersistedStorage } from '@/state/utils';
import { useWallets } from '@/state/wallets/wallets.slice';
import { nextAnimationFrame } from '@/utils/next-animation-frame';
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
            title="Clear"
            onPress={() => clearAllPersistedStorage(wallets.list.map(wallet => wallet.fingerprint))}
          />
          <Button
            title={generatingWallet ? 'Generating…' : 'Create wallet'}
            onPress={async () => {
              setGeneratingWallet(true);
              await nextAnimationFrame();
              await keys.createNewSoftwareWallet();
              setGeneratingWallet(false);
            }}
          />
          <Button title="Toggle network" onPress={() => settings.toggleNetwork()} />
        </View>
        <WalletList />
      </ScrollView>
    </Box>
  );
}
