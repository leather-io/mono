import { Dimensions } from 'react-native';

import { EmptyLayout } from '@/components/loading';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

const { width } = Dimensions.get('window');
const netSize = width * 0.65;

export function ActivityEmpty() {
  return (
    <EmptyLayout
      image={
        <Image
          style={{
            width: netSize,
            height: netSize,
          }}
          contentFit="contain"
          source={require('@/assets/stickers/net.png')}
        />
      }
    >
      <Box width={186}>
        <Text textAlign="center" variant="label01">
          {t`Make your first transaction to get started`}
        </Text>
      </Box>
    </EmptyLayout>
  );
}
