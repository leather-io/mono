import { Box, Text } from '../../../../native';

interface CollectibleCaptionProps {
  name: string;
  size: number;
  subtitle?: string;
}

export function CollectibleCaption({ size, name, subtitle }: CollectibleCaptionProps) {
  return (
    <Box flexDirection="column" gap="1" alignItems="center" maxWidth={size}>
      <Text variant="label01" ellipsizeMode="tail" numberOfLines={1}>
        {name}
      </Text>
      {subtitle && (
        <Text variant="caption01" color="ink.text-subdued" lineHeight={16} fontSize={13}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
}
