import { Box, BulletOperator, Text } from '@leather.io/ui/native';

interface BulletPointProps {
  title: string;
}

export function BulletPoint({ title }: BulletPointProps) {
  return (
    <Box flexDirection="row" gap="1">
      <Box pt="2">
        <BulletOperator borderRadius="round" />
      </Box>
      <Text variant="body01" style={{ flexShrink: 1 }}>
        {title}
      </Text>
    </Box>
  );
}
