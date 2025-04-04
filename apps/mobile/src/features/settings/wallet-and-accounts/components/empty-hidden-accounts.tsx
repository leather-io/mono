import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { Image } from 'expo-image';

import { Box, Text } from '@leather.io/ui/native';

export function EmptyHiddenAccounts() {
  return (
    <Box width="100%" alignItems="center" justifyContent="center">
      <Image
        style={{ height: 200, width: 200 }}
        source={require('@/assets/sticker_door_eyes.png')}
      />
      <Text
        variant="label01"
        style={{ width: 177 }}
        textAlign="center"
        testID={TestId.hiddenAccountsFallbackTitle}
      >
        {t({
          id: 'wallets_list.hidden_accounts_title',
          message: 'View and manage your hidden accounts',
        })}
      </Text>
    </Box>
  );
}
