import { Box, HasChildren, Text } from '@leather.io/ui/native';

export function TokenStatCard({ children }: HasChildren) {
  return (
    <Box flexDirection="row" py="3">
      {children}
    </Box>
  );
}

interface TokenStatCardProps {
  label: string;
  value: string;
}

export function TokenStatCardItem({ label, value }: TokenStatCardProps) {
  return (
    <Box alignItems="flex-start" gap="3" flex={1}>
      <Text variant="label02">{label}</Text>
      <Text variant="label01">{value}</Text>
    </Box>
  );
}
