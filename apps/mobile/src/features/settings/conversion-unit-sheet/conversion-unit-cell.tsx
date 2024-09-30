import { Pressable } from 'react-native';

import { FiatCurrency } from '@leather.io/models';
import { ItemLayout, RadioButton, Text } from '@leather.io/ui/native';

interface ConversionUnitCellProps {
  activeConversionUnit: FiatCurrency;
  fiatCurrencyPreference: FiatCurrency;
  onUpdateConversionUnit(unit: FiatCurrency): void;
  title: string;
}
export function ConversionUnitCell({
  activeConversionUnit,
  fiatCurrencyPreference,
  onUpdateConversionUnit,
  title,
}: ConversionUnitCellProps) {
  return (
    <Pressable onPress={() => onUpdateConversionUnit(fiatCurrencyPreference)}>
      <ItemLayout
        actionIcon={
          <RadioButton disabled isSelected={activeConversionUnit === fiatCurrencyPreference} />
        }
        captionLeft={fiatCurrencyPreference}
        titleLeft={
          <Text textTransform="capitalize" variant="label02">
            {title}
          </Text>
        }
      />
    </Pressable>
  );
}
