import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Button, PlusIcon, Text } from '@leather.io/ui/native';

interface EmptyWalletsScreenProps {
  onPressCreateWallet: () => void;
}

export function EmptyWalletsScreen({ onPressCreateWallet }: EmptyWalletsScreenProps) {
  return (
    <Box width="100%" alignItems="center" justifyContent="center" gap="4" py="7">
      <Box width={270} height={270} alignItems="center" justifyContent="center">
        <Image
          style={{ height: 270, width: 270 }}
          source={require('@/assets/stickers/wallet.png')}
        />
      </Box>
      <Text variant="label01" style={{ width: 200 }} textAlign="center">
        {t`View and manage all your wallets in one place`}
      </Text>
      <Button
        onPress={onPressCreateWallet}
        iconStart={() => <PlusIcon color="ink.background-primary" />}
      >
        {t`Add wallet`}
      </Button>
    </Box>
  );
}
