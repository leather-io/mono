import { Dimensions } from 'react-native';

import { WalletGenerationAnimation } from '@/components/animations/wallet-generation';
import { t } from '@lingui/macro';

import { Box, Text } from '@leather.io/ui/native';

const { height } = Dimensions.get('window');

export default function GeneratingWalletScreen() {
  return (
    <Box flex={1} bg="ink.background-primary">
      <Box
        position="absolute"
        bottom={height / 2}
        left={0}
        right={0}
        zIndex="10"
        justifyContent="center"
        alignItems="center"
      >
        <Text variant="heading04" color="ink.text-subdued">
          {t({
            id: 'add_wallet_animation.title',
            message: 'Adding wallet...',
          })}
        </Text>
      </Box>
      <WalletGenerationAnimation />
    </Box>
  );
}
