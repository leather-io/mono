import { Box, Text } from '@leather.io/ui/native';

interface RecipientSectionHeaderProps {
  title: string;
}

export function RecipientSelectorSectionHeader({ title }: RecipientSectionHeaderProps) {
  return (
    <Box px="5" mt="4" mb="1">
      <Text variant="label02" ml="0.5">
        {title}
      </Text>
    </Box>
  );
}
