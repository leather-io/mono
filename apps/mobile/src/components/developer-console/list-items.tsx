import { Box, ChevronRightIcon, Text, TouchableOpacity } from '@leather.io/ui/native';

interface PressableListItemProps {
  onPress?(): void;
  title: string;
  testID?: string;
}

export function PressableListItem({ onPress, title, testID }: PressableListItemProps) {
  const isDisabled = !onPress;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      justifyContent="space-between"
      flexDirection="row"
      alignItems="center"
      p="3"
      testID={testID}
    >
      <Text variant="label01" color={isDisabled ? 'ink.text-subdued' : 'ink.text-primary'}>
        {title}
      </Text>
      <ChevronRightIcon variant="small" />
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
