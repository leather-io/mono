import { t } from '@lingui/macro';

import { Box, EmojiSmileIcon, Text, TouchableOpacity } from '@leather.io/ui/native';

export function AccountsHeader({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity onPress={onPress} p="3" flexDirection="row" alignItems="center" gap="2">
      <Box borderRadius="round" p="1" bg="blue.background-secondary">
        <EmojiSmileIcon />
      </Box>
      <Text variant="heading05">{t`Account 1`}</Text>
    </TouchableOpacity>
  );
}
