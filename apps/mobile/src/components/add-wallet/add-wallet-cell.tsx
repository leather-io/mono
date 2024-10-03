import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

interface AddWalletCellProps {
  icon?: React.ReactNode;
  title: string;
  caption?: string;
  onPress(): void;
  testID?: string;
}

export function AddWalletCell({ icon, title, caption, onPress, testID }: AddWalletCellProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      py="3"
      flexDirection="row"
      gap="4"
      alignItems="center"
      testID={testID}
    >
      {icon && (
        <Box flexDirection="row" p="2" bg="ink.background-secondary" borderRadius="round">
          {icon}
        </Box>
      )}
      <Box flexDirection="column">
        <Text variant="label02">{title}</Text>
        {caption && (
          <Text color="ink.text-subdued" variant="label03">
            {caption}
          </Text>
        )}
      </Box>
    </TouchableOpacity>
  );
}
