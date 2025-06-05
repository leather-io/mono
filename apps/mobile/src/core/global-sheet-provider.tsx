import { createContext, useContext, useRef } from 'react';

import { HasChildren, SheetInstance, SheetRef } from '@leather.io/ui/native';

interface GlobalSheetContextValue {
  sendSheetRef: SheetRef;
  receiveSheetRef: SheetRef;
  browserSheetRef: SheetRef;
  addAccountSheetRef: SheetRef;
  addWalletSheetRef: SheetRef;
  versionGuardSheetRef: SheetRef;
}

const GlobalSheetContext = createContext<GlobalSheetContextValue | null>(null);

export function useGlobalSheets() {
  const context = useContext(GlobalSheetContext);
  if (!context) throw new Error('`useGlobalSheets` must be used within `GlobalSheetProvider`');
  return context;
}

export function GlobalSheetProvider({ children }: HasChildren) {
  const sendSheetRef = useRef<SheetInstance>(null);
  const receiveSheetRef = useRef<SheetInstance>(null);
  const browserSheetRef = useRef<SheetInstance>(null);
  const addAccountSheetRef = useRef<SheetInstance>(null);
  const addWalletSheetRef = useRef<SheetInstance>(null);
  const versionGuardSheetRef = useRef<SheetInstance>(null);

  return (
    <GlobalSheetContext.Provider
      value={{
        sendSheetRef,
        receiveSheetRef,
        browserSheetRef,
        addAccountSheetRef,
        addWalletSheetRef,
        versionGuardSheetRef,
      }}
    >
      {children}
    </GlobalSheetContext.Provider>
  );
}
