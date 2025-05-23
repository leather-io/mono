import { EmptyLayout } from '@/components/loading';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

export function ActivityEmpty() {
  return (
    <EmptyLayout
      image={
        <Image
          style={{ height: 165, width: 145 }}
          contentFit="cover"
          source={require('@/assets/stickers/net.png')}
        />
      }
    >
      <Box width={186}>
        <Text textAlign="center" variant="label01">
          {t({
            id: 'activity-empty.title',
            message: 'Make your first transaction to get started',
          })}
        </Text>
      </Box>
    </EmptyLayout>
  );
}
