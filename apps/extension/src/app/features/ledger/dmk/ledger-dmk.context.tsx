import { createContext, useContext, useEffect, useState } from 'react';

import type { DeviceManagementKit } from '@ledgerhq/device-management-kit';

import { buildLedgerDmk } from './ledger-dmk';

const ledgerDmkContext = createContext<DeviceManagementKit | null>(null);

interface LedgerDmkProviderProps {
  children: React.ReactNode;
}
export function LedgerDmkProvider({ children }: LedgerDmkProviderProps) {
  const [dmk] = useState(() => buildLedgerDmk());

  useEffect(() => () => dmk.close(), [dmk]);

  return <ledgerDmkContext.Provider value={dmk}>{children}</ledgerDmkContext.Provider>;
}

export function useLedgerDmk() {
  const dmk = useContext(ledgerDmkContext);
  if (!dmk) throw new Error('No LedgerDmkProvider found');
  return dmk;
}
