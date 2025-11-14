import { Container, Newable } from 'inversify';

import { ActivityService } from './activity/activity.service';
import { FungibleAssetInfoService } from './assets/fungible-asset-info.service';
import { RuneAssetService } from './assets/rune-asset.service';
import { Sip10AssetService } from './assets/sip10-asset.service';
import { AccountBalancesService } from './balances/account-balances.service';
import { BtcBalancesService } from './balances/btc-balances.service';
import { RunesBalancesService } from './balances/runes-balances.service';
import { Sip10BalancesService } from './balances/sip10-balances.service';
import { StxBalancesService } from './balances/stx-balances.service';
import { BnsService } from './bns/bns.service';
import { BitcoinCoinSelectionService } from './coin-selection/bitcoin-coin-selection.service';
import { CollectiblesService } from './collectibles/collectibles.service';
import { BitcoinTransactionFeesService } from './fees/bitcoin-transaction-fees.service';
import { StacksTransactionFeesService } from './fees/stacks-transaction-fees.service';
import { BestInSlotApiClient } from './infrastructure/api/best-in-slot/best-in-slot-api.client';
import { BnsV2ApiClient } from './infrastructure/api/bns-v2/bns-v2-api.client';
import { HiroStacksApiClient } from './infrastructure/api/hiro/hiro-stacks-api.client';
import { LeatherApiClient } from './infrastructure/api/leather/leather-api.client';
import { HttpCacheService } from './infrastructure/cache/http-cache.service';
import { Environment } from './infrastructure/environment';
import { SettingsService } from './infrastructure/settings/settings.service';
import { Types } from './inversify.types';
import { MarketDataService } from './market/market-data.service';
import { MarketHistoryService } from './market/market-history.service';
import { NotificationsService } from './notifications/notifications.service';
import { SwapService } from './swap/swap.service';
import { BitcoinTransactionsService } from './transactions/bitcoin-transactions.service';
import { StacksTransactionsService } from './transactions/stacks-transactions.service';
import { UtxosService } from './utxos/utxos.service';
import { BitflowAmmLpService } from './yield/providers/bitflow/bitflow-amm-lp.service';
import { GraniteV1BorrowService } from './yield/providers/granite/granite-v1-borrow.service';
import { GraniteV1EarnService } from './yield/providers/granite/granite-v1-earn.service';
import { StackingDaoStStxService } from './yield/providers/stacking-dao/stacking-dao-ststx.service';
import { StackingDaoStStxBtcService } from './yield/providers/stacking-dao/stacking-dao-ststxbtc.service';
import { ZestBorrowService } from './yield/providers/zest/zest-borrow.service';
import { YieldService } from './yield/yield.service';

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
export function getBnsService() {
  return getServicesContainer().get(BnsService);
}
export function getAccountBalancesService() {
  return getServicesContainer().get(AccountBalancesService);
}
export function getSwapService() {
  return getServicesContainer().get(SwapService);
}
export function getMarketHistoryService() {
  return getServicesContainer().get(MarketHistoryService);
}
export function getStacksTransactionFeesService() {
  return getServicesContainer().get(StacksTransactionFeesService);
}
export function getBitcoinTransactionFeesService() {
  return getServicesContainer().get(BitcoinTransactionFeesService);
}
export function getBitcoinCoinSelectionService() {
  return getServicesContainer().get(BitcoinCoinSelectionService);
}
export function getZestBorrowService() {
  return getServicesContainer().get(ZestBorrowService);
}
export function getStackingDaoStStxService() {
  return getServicesContainer().get(StackingDaoStStxService);
}
export function getStackingDaoStStxBtcService() {
  return getServicesContainer().get(StackingDaoStStxBtcService);
}
export function getBitflowAmmLpService() {
  return getServicesContainer().get(BitflowAmmLpService);
}
export function getGraniteV1EarnService() {
  return getServicesContainer().get(GraniteV1EarnService);
}
export function getGraniteV1BorrowService() {
  return getServicesContainer().get(GraniteV1BorrowService);
}
export function getYieldService() {
  return getServicesContainer().get(YieldService);
}
/* 
  API Layer Clients
*/
export function getLeatherApiClient() {
  return getServicesContainer().get(LeatherApiClient);
}
export function getHiroStacksApiClient() {
  return getServicesContainer().get(HiroStacksApiClient);
}
export function getBisApiClient() {
  return getServicesContainer().get(BestInSlotApiClient);
}
export function getBnsV2ApiClient() {
  return getServicesContainer().get(BnsV2ApiClient);
}
