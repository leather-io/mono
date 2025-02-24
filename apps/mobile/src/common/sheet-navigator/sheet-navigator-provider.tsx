import { createContext, useContext } from 'react';

import { SheetRef } from '@leather.io/ui/native';

export interface SheetNavigatorContext {
  sendSheetRef: React.RefObject<SheetRef>;
  receiveSheetRef: React.RefObject<SheetRef>;
}

const sheetNavigatorContext = createContext<SheetNavigatorContext | null>(null);

export const SheetNavigatorProvider = sheetNavigatorContext.Provider;

export function useSheetNavigatorContext() {
  const context = useContext(sheetNavigatorContext);
  if (!context)
    throw new Error('`useSheetNavigatorContext` must be used within a `SheetNavigatorProvider`');
  return context;
}
