import { createContext, useContext } from 'react';

import type { DeviceManagementKit } from '@ledgerhq/device-management-kit';

import { buildLedgerDmk } from './ledger-dmk';

const ledgerDmkContext = createContext<DeviceManagementKit | null>(null);

let ledgerDmk: DeviceManagementKit | null = null;

function getLedgerDmk(): DeviceManagementKit {
  ledgerDmk ??= buildLedgerDmk();
  return ledgerDmk;
}

interface LedgerDmkProviderProps {
  children: React.ReactNode;
}
export function LedgerDmkProvider({ children }: LedgerDmkProviderProps) {
  return <ledgerDmkContext.Provider value={getLedgerDmk()}>{children}</ledgerDmkContext.Provider>;
}

export function useLedgerDmk() {
  const dmk = useContext(ledgerDmkContext);
  if (!dmk) throw new Error('No LedgerDmkProvider found');
  return dmk;
}
