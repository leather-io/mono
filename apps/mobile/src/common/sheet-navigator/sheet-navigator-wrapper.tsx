import { useRef } from 'react';

import { HasChildren, SheetRef } from '@leather.io/ui/native';

import { SheetNavigatorProvider } from './sheet-navigator-provider';

export default function SheetNavigatorWrapper({ children }: HasChildren) {
  const sendSheetRef = useRef<SheetRef>(null);
  const receiveSheetRef = useRef<SheetRef>(null);

  return (
    <SheetNavigatorProvider value={{ sendSheetRef, receiveSheetRef }}>
      {children}
    </SheetNavigatorProvider>
  );
}
