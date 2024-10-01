import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

interface AddWalletCellProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress(): void;
}
export function AddWalletCell({ icon, title, subtitle, onPress }: AddWalletCellProps) {
  return (
    <TouchableOpacity onPress={onPress} py="3" flexDirection="row" gap="4" alignItems="center">
      {icon && (
        <Box flexDirection="row" p="2" bg="ink.background-secondary" borderRadius="round">
          {icon}
        </Box>
      )}
      <Box flexDirection="column">
        <Text variant="label02">{title}</Text>
        {subtitle && (
          <Text color="ink.text-subdued" variant="label03">
            {subtitle}
          </Text>
        )}
      </Box>
    </TouchableOpacity>
  );
}
