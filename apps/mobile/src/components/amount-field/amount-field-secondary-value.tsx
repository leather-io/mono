import { ArrowTopBottomIcon, Box, Pressable, Text } from '@leather.io/ui/native';

interface AmountFieldSecondaryValueProps {
  children: string;
  onToggleCurrencyMode(): void;
}

export function AmountFieldSecondaryValue({
  children,
  onToggleCurrencyMode,
}: AmountFieldSecondaryValueProps) {
  return (
    <Pressable hitSlop={16} onPress={onToggleCurrencyMode}>
      <Box flexDirection="row" gap="1" alignItems="center">
        <Text variant="label02" color="ink.text-subdued" numberOfLines={1} ellipsizeMode="clip">
          {children}
        </Text>
        <ArrowTopBottomIcon color="ink.text-subdued" variant="small" />
      </Box>
    </Pressable>
  );
}
