import walletImage from '@/assets/stickers/wallet.png';
import { WalletSettingsSelectors } from '@/shared/selectors/wallet-settings.selectors';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, PlusIcon, Text } from '@leather.io/ui/native';

interface EmptyWalletsScreenProps {
  onPressCreateWallet(): void;
}

export function EmptyWalletsScreen({ onPressCreateWallet }: EmptyWalletsScreenProps) {
  return (
    <Box width="100%" alignItems="center" justifyContent="center" gap="4" py="7">
      <Box width={270} height={270} alignItems="center" justifyContent="center">
        <Image style={{ height: 270, width: 270 }} source={walletImage} />
      </Box>
      <Text variant="label01" style={{ width: 200 }} textAlign="center">
        {t`View and manage all your wallets in one place`}
      </Text>
      <Button
        onPress={onPressCreateWallet}
        testID={WalletSettingsSelectors.EmptyWalletsAddWalletButton}
        iconStart={() => <PlusIcon color="ink.background-primary" />}
      >
        {t`Add wallet`}
      </Button>
    </Box>
  );
}
