import { ArrowTopBottomIcon, Pressable, Text } from '@leather.io/ui/native';

interface CurrencySwitchProps {
  value: string;
  onModeSwitch: () => void;
}

export function CurrencyModeSwitcher({ value, onModeSwitch }: CurrencySwitchProps) {
  return (
    <Pressable flexDirection="row" alignItems="center" gap="2" onPress={onModeSwitch}>
      <Text variant="label02" color="ink.text-subdued">
        {value}
      </Text>
      <ArrowTopBottomIcon variant="small" color="ink.text-subdued" />
    </Pressable>
  );
}
