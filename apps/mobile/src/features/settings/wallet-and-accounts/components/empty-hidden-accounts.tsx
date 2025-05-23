import { EmptyLayout } from '@/components/loading/empty-layout';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

export function EmptyHiddenAccounts() {
  return (
    <EmptyLayout
      image={
        <Image style={{ height: 189, width: 155 }} source={require('@/assets/stickers/eyes.png')} />
      }
    >
      <Box width={177}>
        <Text variant="label01" textAlign="center">
          {t({
            id: 'wallets_list.hidden_accounts_title',
            message: 'View and manage your hidden accounts',
          })}
        </Text>
      </Box>
    </EmptyLayout>
  );
}
