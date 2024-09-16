import { FiatCurrency } from '@leather.io/models';
import { ItemLayout, RadioButton, Text, TouchableOpacity } from '@leather.io/ui/native';

interface ConversionUnitCellProps {
  activeConversionUnit: FiatCurrency;
  conversionUnit: FiatCurrency;
  onUpdateConversionUnit(unit: FiatCurrency): void;
  title: string;
}
export function ConversionUnitCell({
  activeConversionUnit,
  conversionUnit,
  onUpdateConversionUnit,
  title,
}: ConversionUnitCellProps) {
  return (
    <TouchableOpacity onPress={() => onUpdateConversionUnit(conversionUnit)}>
      <ItemLayout
        actionIcon={<RadioButton disabled isSelected={activeConversionUnit === conversionUnit} />}
        captionLeft={conversionUnit}
        titleLeft={
          <Text textTransform="capitalize" variant="label02">
            {title}
          </Text>
        }
      />
    </TouchableOpacity>
  );
}
