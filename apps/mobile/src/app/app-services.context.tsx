import React, { ReactNode, createContext, useContext } from 'react';
import { useStore } from 'react-redux';

import { DefaultNetworkConfigurations, defaultNetworksKeyedById } from '@leather.io/models';
import {
  AccountBalanceService,
  BtcBalanceService,
  StxBalanceService,
  TYPES,
  configureDefaultServicesContainer,
  getServicesContainer,
} from '@leather.io/services';

interface AppServicesContext {
  getAccountBalanceService(networkId?: DefaultNetworkConfigurations): AccountBalanceService;
  getBtcBalanceService(networkId?: DefaultNetworkConfigurations): BtcBalanceService;
  getStxBalanceService(networkId?: DefaultNetworkConfigurations): StxBalanceService;
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
  children: ReactNode;
}

export function AppServicesProvider({ children }: AppServicesProviderArgs) {
  const store = useStore();
  configureDefaultServicesContainer(_createNetworkConfigService());

  function _createNetworkConfigService() {
    let currentNetworkId = (store.getState() as any)['settings']['networkPreference'];
    store.subscribe(() => {
      const storeNetworkId = (store.getState() as any)['settings']['networkPreference'];
      currentNetworkId !== storeNetworkId && (currentNetworkId = storeNetworkId);
    });
    return {
      getConfig() {
        return (defaultNetworksKeyedById as any)[currentNetworkId];
      },
    };
  }

  return (
    <appServicesContext.Provider
      value={{ getBtcBalanceService, getStxBalanceService, getAccountBalanceService }}
    >
      {children}
    </appServicesContext.Provider>
  );
}

function getBtcBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getServicesContainer(networkId).get<BtcBalanceService>(TYPES.BtcBalanceService);
}

function getStxBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getServicesContainer(networkId).get<StxBalanceService>(TYPES.StxBalanceService);
}

function getAccountBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getServicesContainer(networkId).get<AccountBalanceService>(TYPES.AccountBalanceService);
}
