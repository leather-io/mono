import { createContext, useContext } from 'react';

import { SheetRef } from '@leather.io/ui/native';

export interface SendSheetContext {
  sendSheetRef: React.RefObject<SheetRef>;
}

const sendSheetContext = createContext<SendSheetContext | null>(null);

export const SendSheetProvider = sendSheetContext.Provider;

export function useSendSheetContext() {
  const context = useContext(sendSheetContext);
  if (!context) throw new Error('`useSendSheetContext` must be used within a `SendSheetProvider`');
  return context;
}
