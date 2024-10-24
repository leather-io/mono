import { queryClient } from '@/queries/query';
import { store } from '@/store';

import { defaultNetworksKeyedById } from '@leather.io/models';
import { QueryClientService, configureServiceContainers } from '@leather.io/services';

export function initAppServices() {
  configureServiceContainers(createNetworkConfigService(), createQueryClientService());
}

function createNetworkConfigService() {
  let currentNetworkId = (store.getState() as any)['settings']['networkPreference'];
  store.subscribe(() => {
    // subscribes to network settings updates to ensure service is synced to store
    const storeNetworkId = (store.getState() as any)['settings']['networkPreference'];
    currentNetworkId !== storeNetworkId && (currentNetworkId = storeNetworkId);
  });
  return {
    getConfig() {
      return (defaultNetworksKeyedById as any)[currentNetworkId];
    },
  };
}

function createQueryClientService(): QueryClientService {
  return {
    // provides query client + cache access via service container
    getQueryClient() {
      return queryClient;
    },
  };
}
