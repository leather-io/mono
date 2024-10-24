import { Container } from 'inversify';

import { DefaultNetworkConfigurations, defaultNetworksKeyedById } from '@leather.io/models';

import {
  CoinGeckoApiClient,
  createCoinGeckoApiClient,
} from './infrastructure/api/coingecko/coingecko-api.client';
import { QueryClientService } from './infrastructure/cache/query-client.service';
import { NetworkSettingsService } from './infrastructure/settings/network-settings.service';
import { MarketDataService, createMarketDataService } from './market-data/market-data.service';

// Symbols for Service Bindings
const Services = {
  QueryClientService: Symbol.for('QueryClientService'),
  NetworkSettingsService: Symbol.for('NetworkSettingsService'),
  CoinGeckoApiClient: Symbol.for('CoinGeckoApiClient'),
  MarketDataService: Symbol.for('MarketDataService'),
};

let currentNetworkContainer: Container;
type NetworkSpecificContainers = Record<string, Container>;
const networkSpecificContainers: Partial<NetworkSpecificContainers> = {};

/**
 * Initializes App Services DI containers
 */
export function configureServiceContainers(
  defaultNetworkSettingsService: NetworkSettingsService,
  queryClientService: QueryClientService
): Container {
  if (!currentNetworkContainer) {
    currentNetworkContainer = new Container();
    registerDependencies(
      currentNetworkContainer,
      defaultNetworkSettingsService,
      queryClientService
    );
    for (const networkId of Object.keys(defaultNetworksKeyedById)) {
      const networkSpecificContainer = new Container();
      registerDependencies(
        networkSpecificContainer,
        {
          getConfig() {
            return (defaultNetworksKeyedById as any)[networkId];
          },
        },
        queryClientService
      );
      networkSpecificContainers[networkId] = networkSpecificContainer;
    }
  }
  return currentNetworkContainer;
}

function getContainer(networkId?: DefaultNetworkConfigurations): Container {
  if (!currentNetworkContainer) {
    throw new Error('Containers must be initialized before accessing');
  }
  return networkId ? networkSpecificContainers[networkId]! : currentNetworkContainer;
}

// Bind Services to Container
function registerDependencies(
  container: Container,
  networkSettingsService: NetworkSettingsService,
  queryClientService: QueryClientService
) {
  container
    .bind<QueryClientService>(Services.QueryClientService)
    .toConstantValue(queryClientService);
  container
    .bind<NetworkSettingsService>(Services.NetworkSettingsService)
    .toConstantValue(networkSettingsService);
  container
    .bind<CoinGeckoApiClient>(Services.CoinGeckoApiClient)
    .toDynamicValue(c =>
      createCoinGeckoApiClient(c.container.get<QueryClientService>(Services.QueryClientService))
    )
    .inSingletonScope();
  container
    .bind<MarketDataService>(Services.MarketDataService)
    .toDynamicValue(c =>
      createMarketDataService(c.container.get<CoinGeckoApiClient>(Services.CoinGeckoApiClient))
    )
    .inSingletonScope();
}

export function getMarketDataService(networkId?: DefaultNetworkConfigurations) {
  return getContainer(networkId).get<MarketDataService>(Services.MarketDataService);
}
