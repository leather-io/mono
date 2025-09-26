import { CurrencyModeSwitcher } from '@/features/swap/components/currency-mode-switcher';
import { SecondaryAmount } from '@/features/swap/swap-state/swap-state.types';
import { InputCurrencyMode } from '@/utils/types';

import { FungibleCryptoAsset } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';

interface AmountFieldProps {
  value: string;
  asset?: FungibleCryptoAsset;
  inputCurrencyMode: InputCurrencyMode;
  onModeSwitch: () => void;
  secondaryAmount: SecondaryAmount;
}

export function AmountField({ value, secondaryAmount, onModeSwitch }: AmountFieldProps) {
  return (
    <Box gap="3" flex={1} overflow="hidden">
      <Text
        variant="heading02"
        fontSize={28}
        lineHeight={36}
        style={{ paddingTop: 1, marginBottom: -1 }}
        numberOfLines={1}
        adjustsFontSizeToFit
        allowFontScaling={false}
      >
        {value}
      </Text>
      <CurrencyModeSwitcher secondaryAmount={secondaryAmount} onModeSwitch={onModeSwitch} />
    </Box>
  );
}
