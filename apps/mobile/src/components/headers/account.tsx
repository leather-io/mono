import EmojiSmile from '@/assets/emoji-smile.svg';

import { Box, TouchableOpacity } from '@leather.io/ui/native';

import { TransText } from '../trans-text';

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
      <Box borderRadius="round" p="1" bg="blue.background-secondary">
        <EmojiSmile width={24} height={24} />
      </Box>
      <TransText variant="heading05">Account 1</TransText>
    </TouchableOpacity>
  );
}
