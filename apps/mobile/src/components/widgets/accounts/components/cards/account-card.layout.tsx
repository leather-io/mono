import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export interface AccountCardLayoutProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  caption: string;
  onPress(): void;
  width?: number;
  testID?: string;
}
export function AccountCardLayout({
  onPress,
  icon,
  label,
  caption,
  width = 200,
  testID,
}: AccountCardLayoutProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      width={width}
      height={180}
      p="5"
      borderRadius="sm"
      borderColor="ink.border-transparent"
      borderWidth={1}
      alignItems="flex-start"
      justifyContent="space-between"
      testID={testID}
    >
      <Box p="2" borderRadius="round" backgroundColor="ink.text-primary">
        {icon}
      </Box>
      <Box gap="1">
        <Text variant="label01">{label}</Text>
        <Text variant="caption01" color="ink.text-subdued">
          {caption}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
