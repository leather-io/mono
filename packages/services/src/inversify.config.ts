import { Container } from 'inversify';

import {
  BitcoinBalancesService,
  createBitcoinBalancesService,
} from './balances/bitcoin-balances.service';
import { AlexSdkClient, createAlexSdkClient } from './infrastructure/api/alex-sdk/alex-sdk.client';
import {
  BestInSlotApiClient,
  createBestInSlotApiClient,
} from './infrastructure/api/best-in-slot/best-in-slot-api.client';
import {
  BinanceApiClient,
  createBinanceApiClient,
} from './infrastructure/api/binance/binance-api.client';
import {
  CoincapApiClient,
  createCoincapApiClient,
} from './infrastructure/api/coincap/coincap-api.client';
import {
  CoinGeckoApiClient,
  createCoinGeckoApiClient,
} from './infrastructure/api/coingecko/coingecko-api.client';
import {
  LeatherApiClient,
  createLeatherApiClient,
} from './infrastructure/api/leather/leather-api.client';
import { HttpCacheService } from './infrastructure/cache/http-cache.service';
import {
  RateLimiterService,
  createRateLimiterService,
} from './infrastructure/rate-limiter/rate-limiter.service';
import { NetworkSettingsService } from './infrastructure/settings/network-settings.service';
import { MarketDataService, createMarketDataService } from './market-data/market-data.service';

let servicesContainer: Container;

export function initializeServiceContainers(
  defaultNetworkSettingsService: NetworkSettingsService,
  cacheService: HttpCacheService
): Container {
  if (!servicesContainer) {
    servicesContainer = new Container();
    registerDependencies(servicesContainer, defaultNetworkSettingsService, cacheService);
  }
  return servicesContainer;
}

export function getContainer(): Container {
  if (!servicesContainer) {
    throw new Error('Containers must be initialized before accessing');
  }
  return servicesContainer;
}

/**
  Register & Bind Services to DI Container
 */
export const Services = {
  // Infrastructure
  NetworkSettingsService: Symbol.for('NetworkSettingsService'),
  HttpCacheService: Symbol.for('HttpCacheService'),
  RateLimiterService: Symbol.for('RateLimiterService'),
  // API clients
  AlexSdkClient: Symbol.for('AlexSdkClient'),
  CoinGeckoApiClient: Symbol.for('CoinGeckoApiClient'),
  CoincapApiClient: Symbol.for('CoincapApiClient'),
  BinanceApiClient: Symbol.for('BinanceApiClient'),
  BestInSlotApiClient: Symbol.for('BestInSlotApiClient'),
  LeatherApiClient: Symbol.for('LeatherApiClient'),
  // Application Services
  MarketDataService: Symbol.for('MarketDataService'),
  BitcoinBalancesService: Symbol.for('BitcoinBalancesService'),
};

function registerDependencies(
  container: Container,
  networkSettingsService: NetworkSettingsService,
  cacheService: HttpCacheService
) {
  container.bind<HttpCacheService>(Services.HttpCacheService).toConstantValue(cacheService);
  container
    .bind<NetworkSettingsService>(Services.NetworkSettingsService)
    .toConstantValue(networkSettingsService);
  container
    .bind<RateLimiterService>(Services.RateLimiterService)
    .toDynamicValue(c =>
      createRateLimiterService(
        c.container.get<NetworkSettingsService>(Services.NetworkSettingsService)
      )
    )
    .inSingletonScope();
  registerApiClients(container);
  registerApplicationServices(container);
}

function registerApiClients(container: Container) {
  container
    .bind<CoinGeckoApiClient>(Services.CoinGeckoApiClient)
    .toDynamicValue(c =>
      createCoinGeckoApiClient(c.container.get<HttpCacheService>(Services.HttpCacheService))
    )
    .inSingletonScope();
  container
    .bind<CoincapApiClient>(Services.CoincapApiClient)
    .toDynamicValue(c =>
      createCoincapApiClient(c.container.get<HttpCacheService>(Services.HttpCacheService))
    )
    .inSingletonScope();
  container
    .bind<BinanceApiClient>(Services.BinanceApiClient)
    .toDynamicValue(c =>
      createBinanceApiClient(c.container.get<HttpCacheService>(Services.HttpCacheService))
    )
    .inSingletonScope();
  container
    .bind<BestInSlotApiClient>(Services.BestInSlotApiClient)
    .toDynamicValue(c =>
      createBestInSlotApiClient(
        c.container.get<NetworkSettingsService>(Services.NetworkSettingsService),
        c.container.get<RateLimiterService>(Services.RateLimiterService),
        c.container.get<HttpCacheService>(Services.HttpCacheService)
      )
    )
    .inSingletonScope();
  container
    .bind<AlexSdkClient>(Services.AlexSdkClient)
    .toDynamicValue(c =>
      createAlexSdkClient(c.container.get<HttpCacheService>(Services.HttpCacheService))
    )
    .inSingletonScope();
  container
    .bind<LeatherApiClient>(Services.LeatherApiClient)
    .toDynamicValue(c =>
      createLeatherApiClient(
        c.container.get<HttpCacheService>(Services.HttpCacheService),
        c.container.get<NetworkSettingsService>(Services.NetworkSettingsService)
      )
    )
    .inSingletonScope();
}

function registerApplicationServices(container: Container) {
  container
    .bind<MarketDataService>(Services.MarketDataService)
    .toDynamicValue(c =>
      createMarketDataService(
        c.container.get<BestInSlotApiClient>(Services.BestInSlotApiClient),
        c.container.get<CoinGeckoApiClient>(Services.CoinGeckoApiClient),
        c.container.get<CoincapApiClient>(Services.CoincapApiClient),
        c.container.get<BinanceApiClient>(Services.BinanceApiClient),
        c.container.get<AlexSdkClient>(Services.AlexSdkClient)
      )
    )
    .inSingletonScope();
  container
    .bind<BitcoinBalancesService>(Services.BitcoinBalancesService)
    .toDynamicValue(c =>
      createBitcoinBalancesService(
        c.container.get<LeatherApiClient>(Services.LeatherApiClient),
        c.container.get<MarketDataService>(Services.MarketDataService)
      )
    )
    .inSingletonScope();
}

/* 
  Export app service instances intended to be consumed by client components
*/
export function getMarketDataService() {
  return getContainer().get<MarketDataService>(Services.MarketDataService);
}
export function getBitcoinBalancesService() {
  return getContainer().get<BitcoinBalancesService>(Services.BitcoinBalancesService);
}
