import { Box, Text } from '@leather.io/ui/native';

interface AddressTypeBadgeProps {
  type: string;
}
export function AddressTypeBadge({ type }: AddressTypeBadgeProps) {
  return (
    <Box
      bg="ink.background-secondary"
      borderColor="ink.border-transparent"
      borderRadius="xs"
      borderWidth={1}
      px="1"
    >
      <Text color="ink.text-subdued-primary" fontSize={11} fontWeight={600} lineHeight={14}>
        {type}
      </Text>
    </Box>
  );
}
