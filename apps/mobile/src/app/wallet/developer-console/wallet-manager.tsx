import { useState } from 'react';
import { Button, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WalletList } from '@/components/account-list/account-list';
import { useKeyStore } from '@/state/key-store';
import { clearAllPersistedStorage } from '@/state/utils';
import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

export default function WalletManager() {
  const insets = useSafeAreaInsets();
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const keys = useKeyStore();

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
        <Button title="Clear store" onPress={() => clearAllPersistedStorage()} />
        <Button
          title={generatingWallet ? 'Generating…' : 'Create wallet'}
          onPress={() => {
            setGeneratingWallet(true);
            requestAnimationFrame(async () => {
              await keys.createNewSoftwareWallet();
              setGeneratingWallet(false);
            });
          }}
        />
        <WalletList />
      </ScrollView>
    </Box>
  );
}
