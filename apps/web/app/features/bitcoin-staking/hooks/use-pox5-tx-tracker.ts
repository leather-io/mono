import { createContext, useContext } from 'react';

import { Pox5TxKind } from '../transactions/pox5-tx-status';

export interface Pox5TrackedTx {
  kind: Pox5TxKind;
  txId: string;
  destination: string | null;
  startedAt: number;
}

interface Pox5TxTrackerContextValue {
  trackedTx: Pox5TrackedTx | null;
  track(trackedTx: Pox5TrackedTx): void;
  clear(): void;
}

export const Pox5TxTrackerContext = createContext<Pox5TxTrackerContextValue | null>(null);

export function usePox5TxTracker() {
  const context = useContext(Pox5TxTrackerContext);
  if (!context) throw new Error('usePox5TxTracker must be used within Pox5TxTrackerProvider');
  return context;
}
