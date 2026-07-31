import { ReactNode, useCallback, useMemo, useState } from 'react';

import { Pox5TrackedTx, Pox5TxTrackerContext } from '../hooks/use-pox5-tx-tracker';
import { Pox5TxStatusScreen } from './pox5-tx-status-screen';

interface Pox5TxTrackerProviderProps {
  children: ReactNode;
}

export function Pox5TxTrackerProvider({ children }: Pox5TxTrackerProviderProps) {
  const [trackedTx, setTrackedTx] = useState<Pox5TrackedTx | null>(null);

  const track = useCallback((next: Pox5TrackedTx) => setTrackedTx(next), []);
  const clear = useCallback(() => setTrackedTx(null), []);

  const value = useMemo(() => ({ trackedTx, track, clear }), [trackedTx, track, clear]);

  return (
    <Pox5TxTrackerContext.Provider value={value}>
      {trackedTx ? <Pox5TxStatusScreen trackedTx={trackedTx} /> : children}
    </Pox5TxTrackerContext.Provider>
  );
}
