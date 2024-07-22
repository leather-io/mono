import EmojiSmile from '@/assets/emoji-smile.svg';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export function AccountHeader({ onPress }: { onPress?(): void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      height={48}
      px="3"
      flexDirection="row"
      alignItems="center"
      gap="2"
    >
      <Box borderRadius="round" p="1" bg="base.blue.background-secondary">
        <EmojiSmile width={24} height={24} />
      </Box>
      <Text variant="heading05">Account 1</Text>
    </TouchableOpacity>
  );
}