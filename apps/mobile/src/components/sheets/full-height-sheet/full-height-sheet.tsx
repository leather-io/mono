import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sheet, SheetProps, SheetRef } from '@leather.io/ui/native';

interface FullHeightSheetProps extends Omit<SheetProps, 'ref'> {
  sheetRef: SheetRef;
}
export function FullHeightSheet({ sheetRef, ...sheetProps }: FullHeightSheetProps) {
  const { top } = useSafeAreaInsets();
  const minimumHandleOffset = 8;

  return (
    <Sheet
      ref={sheetRef}
      handlePlacement="inside"
      handleStyle={{ marginTop: Math.max(top, minimumHandleOffset) }}
      {...sheetProps}
      snapPoints={['100%']}
      enableDynamicSizing={false}
    />
  );
}
