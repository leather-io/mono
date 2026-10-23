import eyesImage from '@/assets/stickers/eyes.png';
import { EmptyLayout } from '@/components/loading/empty-layout';
import { t } from '@lingui/core/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

export function EmptyHiddenAccounts() {
  return (
    <EmptyLayout image={<Image style={{ height: 270, width: 270 }} source={eyesImage} />}>
      <Box width={177}>
        <Text variant="label01" textAlign="center">
          {t`View and manage your hidden accounts`}
        </Text>
      </Box>
    </EmptyLayout>
  );
}
