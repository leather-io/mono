import { FiatCurrency } from '@leather.io/models';
import { ItemLayout, RadioButton, Text, TouchableOpacity } from '@leather.io/ui/native';

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
    <TouchableOpacity onPress={() => onUpdateConversionUnit(fiatCurrencyPreference)}>
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
    </TouchableOpacity>
  );
}
