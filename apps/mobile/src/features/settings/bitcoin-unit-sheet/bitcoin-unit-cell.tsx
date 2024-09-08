import { BitcoinUnit, BitcoinUnitInfo } from '@leather.io/models';
import { ItemLayout, RadioButton, TouchableOpacity } from '@leather.io/ui/native';

interface BitcoinUnitCellProps {
  activeBitcoinUnit: BitcoinUnit;
  caption: string;
  onUpdateBitcoinUnit(unit: BitcoinUnit): void;
  unit: BitcoinUnitInfo;
  title: string;
}
export function BitcoinUnitCell({
  activeBitcoinUnit,
  caption,
  onUpdateBitcoinUnit,
  unit,
  title,
}: BitcoinUnitCellProps) {
  return (
    <TouchableOpacity onPress={() => onUpdateBitcoinUnit(unit.name)}>
      <ItemLayout
        actionIcon={<RadioButton disabled isSelected={activeBitcoinUnit === unit.name} />}
        captionLeft={caption}
        titleLeft={title}
      />
    </TouchableOpacity>
  );
}
