import { useTheme } from '@shopify/restyle';

import { ArrowTopBottomIcon, Box, Pressable, Text, Theme } from '@leather.io/ui/native';

interface AmountFieldSecondaryValueProps {
  value: string;
  onToggleCurrencyMode(): void;
}

export function AmountFieldSecondaryValue({
  value,
  onToggleCurrencyMode,
}: AmountFieldSecondaryValueProps) {
  const theme = useTheme<Theme>();

  return (
    <Pressable hitSlop={16} onPress={onToggleCurrencyMode}>
      <Box flexDirection="row" gap="1" alignItems="center">
        <Text variant="label02" color="ink.text-subdued" numberOfLines={1} ellipsizeMode="clip">
          {value}
        </Text>
        <ArrowTopBottomIcon color={theme.colors['ink.text-subdued']} variant="small" />
      </Box>
    </Pressable>
  );
}
