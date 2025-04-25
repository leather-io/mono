import { EmptyLayout } from '@/components/loading';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box } from '@leather.io/ui/native';

export function ActivityEmpty() {
  return (
    <EmptyLayout
      title={t({ id: 'activity-empty.title', message: "It's quiet in here" })}
      subtitle={t({
        id: 'activity-empty.subtitle',
        message: 'Do your first transaction to begin.',
      })}
      img={
        <Box px="5" py="4">
          <Image
            style={{ height: 57, width: 54 }}
            source={require('@/assets/sticker_no_activity.png')}
          />
        </Box>
      }
    />
  );
}
