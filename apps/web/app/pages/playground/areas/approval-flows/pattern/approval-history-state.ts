import { createContext, useContext } from 'react';

import type { ApprovalHistoryState } from './approval-direction';

export const ApprovalHistoryStateContext = createContext<ApprovalHistoryState | undefined>(
  undefined
);

export function useApprovalHistoryState() {
  return useContext(ApprovalHistoryStateContext);
}
