import ChevronRight from '@/assets/chevron-right.svg';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export function PressableListItem({ onPress, title }: { onPress?(): void; title: string }) {
  const isDisabled = !onPress;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      justifyContent="space-between"
      flexDirection="row"
      alignItems="center"
      p="3"
    >
      <Text variant="label01" color={isDisabled ? 'ink.text-subdued' : 'ink.text-primary'}>
        {title}
      </Text>
      <ChevronRight width={16} height={16} />
    </TouchableOpacity>
  );
}

export function TitleListItem({ title }: { title: string }) {
  return (
    <Box justifyContent="center" p="3">
      <Text variant="label01" color="ink.text-subdued">
        {title}
      </Text>
    </Box>
  );
}
