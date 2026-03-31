import { FeeTypes } from '@leather.io/models';

import { FeeEstimateItem } from './fee-estimate-item';
import { FeeEstimateSelectLayout } from './fee-estimate-select.layout';

interface FeeEstimateSelectProps {
  isVisible: boolean;
  onSelectItem(index: number): void;
  onSetIsSelectVisible(value: boolean): void;
  selectedItem: number;
  allowCustom: boolean;
  disableFeeSelection?: boolean;
}
export function FeeEstimateSelect({
  isVisible,
  onSelectItem,
  onSetIsSelectVisible,
  selectedItem,
  allowCustom,
  disableFeeSelection,
}: FeeEstimateSelectProps) {
  return (
    <FeeEstimateSelectLayout
      disableFeeSelection={disableFeeSelection}
      isVisible={isVisible}
      onSetIsSelectVisible={onSetIsSelectVisible}
      selectedItem={selectedItem}
    >
      <FeeEstimateItem
        index={FeeTypes.Low}
        isVisible={isVisible}
        onSelectItem={onSelectItem}
        selectedItem={selectedItem}
      />
      <FeeEstimateItem
        index={FeeTypes.Middle}
        isVisible={isVisible}
        onSelectItem={onSelectItem}
        selectedItem={selectedItem}
      />
      <FeeEstimateItem
        index={FeeTypes.High}
        isVisible={isVisible}
        onSelectItem={onSelectItem}
        selectedItem={selectedItem}
      />

      {allowCustom && (
        <FeeEstimateItem
          index={FeeTypes.Custom}
          isVisible={isVisible}
          onSelectItem={onSelectItem}
          selectedItem={selectedItem}
        />
      )}
    </FeeEstimateSelectLayout>
  );
}
