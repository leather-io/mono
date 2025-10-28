import { createContext, useContext, useRef } from 'react';

import {
  ApproverSheetInstance,
  type ApproverSheetRef,
} from '@/features/browser/approver-sheet/approver-sheet';
import { ReceiveSheetInstance, ReceiveSheetRef } from '@/features/receive/receive-sheet';
import { SendSheetInstance, SendSheetRef } from '@/features/send/send-sheet';
import {
  DescriptionSheetInstance,
  DescriptionSheetRef,
} from '@/features/settings/description-sheet';
import { SwapSheetInstance, SwapSheetRef } from '@/features/swap/swap-sheet';

import { HasChildren, SheetInstance, SheetRef } from '@leather.io/ui/native';

interface GlobalSheetContextValue {
  sendSheetRef: SendSheetRef;
  receiveSheetRef: ReceiveSheetRef;
  swapSheetRef: SwapSheetRef;
  browserSheetRef: SheetRef;
  addAccountSheetRef: SheetRef;
  addWalletSheetRef: SheetRef;
  versionGuardSheetRef: SheetRef;
  descriptionSheetRef: DescriptionSheetRef;
  approverSheetRef: ApproverSheetRef;
}

const GlobalSheetContext = createContext<GlobalSheetContextValue | null>(null);

export function useGlobalSheets() {
  const context = useContext(GlobalSheetContext);
  if (!context) throw new Error('`useGlobalSheets` must be used within `GlobalSheetProvider`');
  return context;
}

export function GlobalSheetProvider({ children }: HasChildren) {
  const sendSheetRef = useRef<SendSheetInstance>(null);
  const receiveSheetRef = useRef<ReceiveSheetInstance>(null);
  const swapSheetRef = useRef<SwapSheetInstance>(null);
  const browserSheetRef = useRef<SheetInstance>(null);
  const addAccountSheetRef = useRef<SheetInstance>(null);
  const addWalletSheetRef = useRef<SheetInstance>(null);
  const versionGuardSheetRef = useRef<SheetInstance>(null);
  const descriptionSheetRef = useRef<DescriptionSheetInstance>(null);
  const approverSheetRef = useRef<ApproverSheetInstance>(null);

  return (
    <GlobalSheetContext.Provider
      value={{
        sendSheetRef,
        receiveSheetRef,
        swapSheetRef,
        browserSheetRef,
        addAccountSheetRef,
        addWalletSheetRef,
        versionGuardSheetRef,
        descriptionSheetRef,
        approverSheetRef,
      }}
    >
      {children}
    </GlobalSheetContext.Provider>
  );
}
