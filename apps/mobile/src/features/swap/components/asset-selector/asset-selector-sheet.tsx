import { ReactNode, useEffect, useRef } from 'react';

import { Sheet, SheetInstance } from '@leather.io/ui/native';

interface AssetSelectorSheetProps {
  isOpen: boolean;
  onClose(): void;
  children: ReactNode;
}

export function AssetSelectorSheet({ isOpen, onClose, children }: AssetSelectorSheetProps) {
  const sheetRef = useRef<SheetInstance>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <Sheet
      ref={sheetRef}
      onDismiss={onClose}
      snapPoints={['75%']}
      enableDynamicSizing={false}
      keyboardBehavior="extend"
    >
      {children}
    </Sheet>
  );
}
