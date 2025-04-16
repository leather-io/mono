import { createContext, useContext, useRef } from 'react';

import { HasChildren, SheetRef } from '@leather.io/ui/native';

interface GlobalSheetContextValue {
  sendSheetRef: React.RefObject<SheetRef>;
  receiveSheetRef: React.RefObject<SheetRef>;
  browserSheetRef: React.RefObject<SheetRef>;
}

const GlobalSheetContext = createContext<GlobalSheetContextValue | null>(null);

export function useGlobalSheets() {
  const context = useContext(GlobalSheetContext);
  if (!context) throw new Error('`useGlobalSheets` must be used within `GlobalSheetProvider`');
  return context;
}

export default function GlobalSheetProvider({ children }: HasChildren) {
  const sendSheetRef = useRef<SheetRef>(null);
  const receiveSheetRef = useRef<SheetRef>(null);
  const browserSheetRef = useRef<SheetRef>(null);

  return (
    <GlobalSheetContext.Provider value={{ sendSheetRef, receiveSheetRef, browserSheetRef }}>
      {children}
    </GlobalSheetContext.Provider>
  );
}
