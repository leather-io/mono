import { createContext, useContext, useRef } from 'react';

import { HasChildren, SheetRef } from '@leather.io/ui/native';

interface GlobalSheetContextValue {
  sendSheetRef: React.RefObject<SheetRef | null>;
  receiveSheetRef: React.RefObject<SheetRef | null>;
  browserSheetRef: React.RefObject<SheetRef | null>;
  addAccountSheetRef: React.RefObject<SheetRef | null>;
  addWalletSheetRef: React.RefObject<SheetRef | null>;
}

const GlobalSheetContext = createContext<GlobalSheetContextValue | null>(null);

export function useGlobalSheets() {
  const context = useContext(GlobalSheetContext);
  if (!context) throw new Error('`useGlobalSheets` must be used within `GlobalSheetProvider`');
  return context;
}

export function GlobalSheetProvider({ children }: HasChildren) {
  const sendSheetRef = useRef<SheetRef>(null);
  const receiveSheetRef = useRef<SheetRef>(null);
  const browserSheetRef = useRef<SheetRef>(null);
  const addAccountSheetRef = useRef<SheetRef>(null);
  const addWalletSheetRef = useRef<SheetRef>(null);

  return (
    <GlobalSheetContext.Provider
      value={{
        sendSheetRef,
        receiveSheetRef,
        browserSheetRef,
        addAccountSheetRef,
        addWalletSheetRef,
      }}
    >
      {children}
    </GlobalSheetContext.Provider>
  );
}
