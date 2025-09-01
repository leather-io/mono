import { Dimensions } from 'react-native';

import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

const { width } = Dimensions.get('window');

const gemSize = width * 0.45;

export function EmptyCollectiblesState() {
  return (
    <Box alignItems="center" gap="1">
      <Image
        style={{ height: gemSize, width: gemSize }}
        source={require('@/assets/stickers/gem-2.png')}
      />
      <Text variant="label01">{t`Add your collection here`}</Text>
    </Box>
  );
}
