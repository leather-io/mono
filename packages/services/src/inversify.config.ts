import { Container, Newable } from 'inversify';

import { ActivityService } from './activity/activity.service';
import { FungibleAssetInfoService } from './assets/fungible-asset-info.service';
import { RuneAssetService } from './assets/rune-asset.service';
import { Sip10AssetService } from './assets/sip10-asset.service';
import { BtcBalancesService } from './balances/btc-balances.service';
import { RunesBalancesService } from './balances/runes-balances.service';
import { Sip10BalancesService } from './balances/sip10-balances.service';
import { StxBalancesService } from './balances/stx-balances.service';
import { CollectiblesService } from './collectibles/collectibles.service';
import { HttpCacheService } from './infrastructure/cache/http-cache.service';
import { Environment } from './infrastructure/environment';
import { SettingsService } from './infrastructure/settings/settings.service';
import { Types } from './inversify.types';
import { MarketDataService } from './market-data/market-data.service';
import { NotificationsService } from './notifications/notifications.service';
import { BitcoinTransactionsService } from './transactions/bitcoin-transactions.service';
import { StacksTransactionsService } from './transactions/stacks-transactions.service';
import { UtxosService } from './utxos/utxos.service';

let servicesContainer: Container;

export interface InitServicesContainerOptions {
  env: Environment;
  settingsService: Newable<SettingsService>;
  cacheService: Newable<HttpCacheService>;
}

export function initServicesContainer(options: InitServicesContainerOptions): Container {
  if (!servicesContainer) {
    servicesContainer = new Container({ autobind: true, defaultScope: 'Singleton' });
    servicesContainer.bind(Types.Environment).toConstantValue(options.env);
    servicesContainer
      .bind<SettingsService>(Types.SettingsService)
      .to(options.settingsService)
      .inSingletonScope();
    servicesContainer
      .bind<HttpCacheService>(Types.CacheService)
      .to(options.cacheService)
      .inSingletonScope();
  }
  return servicesContainer;
}

export function getServicesContainer() {
  if (!servicesContainer) {
    throw new Error('Container must be initialized before accessing');
  }
  return servicesContainer;
}

/* 
  Services API - Export service resolvers for use in client application components
*/
export function getMarketDataService() {
  return getServicesContainer().get(MarketDataService);
}
export function getBtcBalancesService() {
  return getServicesContainer().get(BtcBalancesService);
}
export function getStxBalancesService() {
  return getServicesContainer().get(StxBalancesService);
}
export function getSip10BalancesService() {
  return getServicesContainer().get(Sip10BalancesService);
}
export function getRunesBalancesService() {
  return getServicesContainer().get(RunesBalancesService);
}
export function getSip10AssetService() {
  return getServicesContainer().get(Sip10AssetService);
}
export function getRuneAssetService() {
  return getServicesContainer().get(RuneAssetService);
}
export function getUtxosService() {
  return getServicesContainer().get(UtxosService);
}
export function getStacksTransactionsService() {
  return getServicesContainer().get(StacksTransactionsService);
}
export function getBitcoinTransactionsService() {
  return getServicesContainer().get(BitcoinTransactionsService);
}
export function getActivityService() {
  return getServicesContainer().get(ActivityService);
}
export function getCollectiblesService() {
  return getServicesContainer().get(CollectiblesService);
}
export function getNotificationsService() {
  return getServicesContainer().get(NotificationsService);
}
export function getFungibleAssetInfoService() {
  return getServicesContainer().get(FungibleAssetInfoService);
}
