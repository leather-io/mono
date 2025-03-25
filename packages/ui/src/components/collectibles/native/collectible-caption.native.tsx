import { Box, Text } from '../../../../native';

interface CollectibleCaptionProps {
  name: string;
  size: number;
  subtitle?: string;
}

export function CollectibleCaption({ size, name, subtitle }: CollectibleCaptionProps) {
  return (
    <Box flexDirection="column" gap="1" alignItems="center" maxWidth={size}>
      <Text ellipsizeMode="tail" numberOfLines={1}>
        {name}
      </Text>
      {subtitle && <Text color="ink.text-subdued">{subtitle}</Text>}
    </Box>
  );
}
