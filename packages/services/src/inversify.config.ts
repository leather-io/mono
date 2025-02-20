import { Container } from 'inversify';

import { RuneAssetService, createRuneAssetService } from './assets/rune-asset.service';
import { Sip10AssetService, createSip10AssetService } from './assets/sip10-asset.service';
import { BtcBalancesService, createBtcBalancesService } from './balances/btc-balances.service';
import {
  RunesBalancesService,
  createRunesBalancesService,
} from './balances/runes-balances.service';
import {
  Sip10BalancesService,
  createSip10BalancesService,
} from './balances/sip10-balances.service';
import { StxBalancesService, createStxBalancesService } from './balances/stx-balances.service';
import {
  BestInSlotApiClient,
  createBestInSlotApiClient,
} from './infrastructure/api/best-in-slot/best-in-slot-api.client';
import {
  HiroStacksApiClient,
  createHiroStacksApiClient,
} from './infrastructure/api/hiro/hiro-stacks-api.client';
import {
  LeatherApiClient,
  createLeatherApiClient,
} from './infrastructure/api/leather/leather-api.client';
import { HttpCacheService } from './infrastructure/cache/http-cache.service';
import {
  RateLimiterService,
  createRateLimiterService,
} from './infrastructure/rate-limiter/rate-limiter.service';
import { SettingsService } from './infrastructure/settings/settings.service';
import { MarketDataService, createMarketDataService } from './market-data/market-data.service';
import {
  NotificationsService,
  createNotificationsService,
} from './notifications/notifications.service';
import {
  BitcoinTransactionsService,
  createBitcoinTransactionsService,
} from './transactions/bitcoin-transactions.service';
import {
  StacksTransactionsService,
  createStacksTransactionsService,
} from './transactions/stacks-transactions.service';
import { UtxosService, createUtxosService } from './utxos/utxos.service';

let servicesContainer: Container;

export function initializeServiceContainers(
  settingsService: SettingsService,
  cacheService: HttpCacheService
): Container {
  if (!servicesContainer) {
    servicesContainer = new Container();
    registerDependencies(servicesContainer, settingsService, cacheService);
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
  SettingsService: Symbol.for('SettingsService'),
  HttpCacheService: Symbol.for('HttpCacheService'),
  RateLimiterService: Symbol.for('RateLimiterService'),
  // API clients
  BestInSlotApiClient: Symbol.for('BestInSlotApiClient'),
  HiroStacksApiClient: Symbol.for('HiroStacksApiClient'),
  LeatherApiClient: Symbol.for('LeatherApiClient'),
  // Application Services
  MarketDataService: Symbol.for('MarketDataService'),
  BtcBalancesService: Symbol.for('BtcBalancesService'),
  StxBalancesService: Symbol.for('StxBalancesService'),
  Sip10BalancesService: Symbol.for('Sip10BalancesService'),
  RunesBalancesService: Symbol.for('RunesBalancesService'),
  Sip10AssetService: Symbol.for('Sip10AssetService'),
  RuneAssetService: Symbol.for('RuneAssetService'),
  UtxosService: Symbol.for('UtxosService'),
  StacksTransactionsService: Symbol.for('StacksTransactionsService'),
  BitcoinTransactionsService: Symbol.for('BitcoinTransactionsService'),
  NotificationsService: Symbol.for('NotificationsService'),
};

function registerDependencies(
  container: Container,
  settingsService: SettingsService,
  cacheService: HttpCacheService
) {
  container.bind<HttpCacheService>(Services.HttpCacheService).toConstantValue(cacheService);
  container.bind<SettingsService>(Services.SettingsService).toConstantValue(settingsService);
  container
    .bind<RateLimiterService>(Services.RateLimiterService)
    .toDynamicValue(c =>
      createRateLimiterService(c.container.get<SettingsService>(Services.SettingsService))
    )
    .inSingletonScope();
  registerApiClients(container);
  registerApplicationServices(container);
}

function registerApiClients(container: Container) {
  container
    .bind<BestInSlotApiClient>(Services.BestInSlotApiClient)
    .toDynamicValue(c =>
      createBestInSlotApiClient(
        c.container.get<SettingsService>(Services.SettingsService),
        c.container.get<RateLimiterService>(Services.RateLimiterService),
        c.container.get<HttpCacheService>(Services.HttpCacheService)
      )
    )
    .inSingletonScope();
  container
    .bind<HiroStacksApiClient>(Services.HiroStacksApiClient)
    .toDynamicValue(c =>
      createHiroStacksApiClient(
        c.container.get<HttpCacheService>(Services.HttpCacheService),
        c.container.get<SettingsService>(Services.SettingsService),
        c.container.get<RateLimiterService>(Services.RateLimiterService)
      )
    )
    .inSingletonScope();
  container
    .bind<LeatherApiClient>(Services.LeatherApiClient)
    .toDynamicValue(c =>
      createLeatherApiClient(
        c.container.get<HttpCacheService>(Services.HttpCacheService),
        c.container.get<SettingsService>(Services.SettingsService)
      )
    )
    .inSingletonScope();
}

function registerApplicationServices(container: Container) {
  container
    .bind<MarketDataService>(Services.MarketDataService)
    .toDynamicValue(c =>
      createMarketDataService(
        c.container.get<SettingsService>(Services.SettingsService),
        c.container.get<LeatherApiClient>(Services.LeatherApiClient),
        c.container.get<BestInSlotApiClient>(Services.BestInSlotApiClient)
      )
    )
    .inSingletonScope();
  container
    .bind<Sip10AssetService>(Services.Sip10AssetService)
    .toDynamicValue(c =>
      createSip10AssetService(c.container.get<HiroStacksApiClient>(Services.HiroStacksApiClient))
    )
    .inSingletonScope();
  container
    .bind<RuneAssetService>(Services.RuneAssetService)
    .toDynamicValue(c =>
      createRuneAssetService(c.container.get<BestInSlotApiClient>(Services.BestInSlotApiClient))
    )
    .inSingletonScope();
  container
    .bind<BtcBalancesService>(Services.BtcBalancesService)
    .toDynamicValue(c =>
      createBtcBalancesService(
        c.container.get<SettingsService>(Services.SettingsService),
        c.container.get<UtxosService>(Services.UtxosService),
        c.container.get<MarketDataService>(Services.MarketDataService)
      )
    )
    .inSingletonScope();
  container
    .bind<StxBalancesService>(Services.StxBalancesService)
    .toDynamicValue(c =>
      createStxBalancesService(
        c.container.get<SettingsService>(Services.SettingsService),
        c.container.get<HiroStacksApiClient>(Services.HiroStacksApiClient),
        c.container.get<MarketDataService>(Services.MarketDataService),
        c.container.get<StacksTransactionsService>(Services.StacksTransactionsService)
      )
    )
    .inSingletonScope();
  container
    .bind<Sip10BalancesService>(Services.Sip10BalancesService)
    .toDynamicValue(c =>
      createSip10BalancesService(
        c.container.get<SettingsService>(Services.SettingsService),
        c.container.get<HiroStacksApiClient>(Services.HiroStacksApiClient),
        c.container.get<MarketDataService>(Services.MarketDataService),
        c.container.get<Sip10AssetService>(Services.Sip10AssetService)
      )
    )
    .inSingletonScope();
  container
    .bind<RunesBalancesService>(Services.RunesBalancesService)
    .toDynamicValue(c =>
      createRunesBalancesService(
        c.container.get<SettingsService>(Services.SettingsService),
        c.container.get<BestInSlotApiClient>(Services.BestInSlotApiClient),
        c.container.get<MarketDataService>(Services.MarketDataService),
        c.container.get<RuneAssetService>(Services.RuneAssetService)
      )
    )
    .inSingletonScope();
  container
    .bind<UtxosService>(Services.UtxosService)
    .toDynamicValue(c =>
      createUtxosService(
        c.container.get<LeatherApiClient>(Services.LeatherApiClient),
        c.container.get<BestInSlotApiClient>(Services.BestInSlotApiClient),
        c.container.get<BitcoinTransactionsService>(Services.BitcoinTransactionsService)
      )
    )
    .inSingletonScope();
  container
    .bind<StacksTransactionsService>(Services.StacksTransactionsService)
    .toDynamicValue(c =>
      createStacksTransactionsService(
        c.container.get<HiroStacksApiClient>(Services.HiroStacksApiClient)
      )
    )
    .inSingletonScope();
  container
    .bind<BitcoinTransactionsService>(Services.BitcoinTransactionsService)
    .toDynamicValue(c =>
      createBitcoinTransactionsService(c.container.get<LeatherApiClient>(Services.LeatherApiClient))
    )
    .inSingletonScope();
  container
    .bind<NotificationsService>(Services.NotificationsService)
    .toDynamicValue(c =>
      createNotificationsService(c.container.get<LeatherApiClient>(Services.LeatherApiClient))
    )
    .inSingletonScope();
}

/* 
  Services API - Export service resolvers for use in client application components
*/
export function getMarketDataService() {
  return getContainer().get<MarketDataService>(Services.MarketDataService);
}
export function getBtcBalancesService() {
  return getContainer().get<BtcBalancesService>(Services.BtcBalancesService);
}
export function getStxBalancesService() {
  return getContainer().get<StxBalancesService>(Services.StxBalancesService);
}
export function getSip10BalancesService() {
  return getContainer().get<Sip10BalancesService>(Services.Sip10BalancesService);
}
export function getRunesBalancesService() {
  return getContainer().get<RunesBalancesService>(Services.RunesBalancesService);
}
export function getSip10AssetService() {
  return getContainer().get<Sip10AssetService>(Services.Sip10AssetService);
}
export function getRuneAssetService() {
  return getContainer().get<RuneAssetService>(Services.RuneAssetService);
}
export function getUtxosService() {
  return getContainer().get<UtxosService>(Services.UtxosService);
}
export function getStacksTransactionsService() {
  return getContainer().get<StacksTransactionsService>(Services.StacksTransactionsService);
}
export function getNotificationsService() {
  return getContainer().get<NotificationsService>(Services.NotificationsService);
}
