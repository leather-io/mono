import React, { ReactNode, createContext, useContext } from 'react';

import { BitcoinBalanceService, UtxoService, configureContainer } from '@leather.io/services';

interface AppServicesContext {
  btcBalanceService: BitcoinBalanceService;
  utxoService: UtxoService;
}

const appServicesContext = createContext<AppServicesContext | null>(null);

export function useAppServices() {
  const context = useContext(appServicesContext);
  if (!context) {
    throw new Error('Application Services must be used within a AppServicesProvider');
  }
  return context;
}

export interface AppServicesProviderArgs {
  config: Record<string, any>;
  children: ReactNode;
}

export function AppServicesProvider({ config, children }: AppServicesProviderArgs) {
  const container = configureContainer(config);
  const btcBalanceService = container.get<BitcoinBalanceService>(BitcoinBalanceService);
  const utxoService = container.get<UtxoService>(UtxoService);
  return (
    <appServicesContext.Provider value={{ btcBalanceService, utxoService }}>
      {children}
    </appServicesContext.Provider>
  );
}
