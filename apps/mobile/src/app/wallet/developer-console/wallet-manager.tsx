import { useState } from 'react';
import { Button, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WalletList } from '@/components/wallet-manager';
import { useKeyStore } from '@/state/key-store';
import { deleteAllMnemonics } from '@/state/storage-persistors';
import { clearAllPersistedStorage } from '@/state/utils';
import { useWallets } from '@/state/wallets/wallets.slice';
import { nextAnimationFrame } from '@/utils/next-animation-frame';
import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

export default function WalletManager() {
  const insets = useSafeAreaInsets();
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const keys = useKeyStore();
  const wallets = useWallets();
  const [generatingWallet, setGeneratingWallet] = useState(false);
  return (
    <Box flex={1} backgroundColor="base.ink.background-primary">
      <ScrollView
        contentContainerStyle={{
          marginTop: theme.spacing['7'],
          paddingHorizontal: theme.spacing['3'],
          paddingTop: insets.top + theme.spacing['5'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <Button
          title="Clear store"
          onPress={async () => {
            const fingerprintArr = wallets.list.map(wallet => wallet.fingerprint);
            await deleteAllMnemonics(fingerprintArr);
            await clearAllPersistedStorage();
          }}
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
        <WalletList />
      </ScrollView>
    </Box>
  );
}
