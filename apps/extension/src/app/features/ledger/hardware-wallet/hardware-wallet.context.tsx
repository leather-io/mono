import { createContext, useContext } from 'react';

import {
  type HardwareWalletConnector,
  type HardwareWalletRegistry,
  createHardwareWalletRegistry,
} from '@leather.io/ledger';

import { createExtensionLedgerConnector } from './ledger-connector';

const hardwareWalletContext = createContext<HardwareWalletRegistry | null>(null);

let hardwareWalletRegistry: HardwareWalletRegistry | null = null;

function getHardwareWalletRegistry(): HardwareWalletRegistry {
  hardwareWalletRegistry ??= createHardwareWalletRegistry([createExtensionLedgerConnector()]);
  return hardwareWalletRegistry;
}

interface HardwareWalletProviderProps {
  children: React.ReactNode;
}
export function HardwareWalletProvider({ children }: HardwareWalletProviderProps) {
  return (
    <hardwareWalletContext.Provider value={getHardwareWalletRegistry()}>
      {children}
    </hardwareWalletContext.Provider>
  );
}

export function useHardwareWalletConnector(): HardwareWalletConnector {
  const registry = useContext(hardwareWalletContext);
  if (!registry) throw new Error('No HardwareWalletProvider found');
  return registry.get('ledger');
}
