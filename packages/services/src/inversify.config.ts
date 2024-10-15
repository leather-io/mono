import { BlockbookApiClient, BlockbookApiClientImpl } from 'api/blockbook/blockbook.client';
import {
  MempoolSpaceApiClient,
  MempoolSpaceApiClientImpl,
} from 'api/mempool-space/mempool-space.client';
import { BtcBalanceService, BtcBalanceServiceImpl } from 'balances/bitcoin/btc-balance.service';
import { Container } from 'inversify';
import { TYPES } from 'inversify-types';
import 'reflect-metadata';
import { NetworkSettingsService } from 'settings/network-settings.service';
import { UtxoService, UtxoServiceImpl } from 'utxos/utxo.service';

import { DefaultNetworkConfigurations, defaultNetworksKeyedById } from '@leather.io/models';
import { AccountBalanceService, AccountBalanceServiceImpl } from 'balances/account-balance.service';
import { StxBalanceService, StxBalanceServiceImpl } from 'balances/stacks/stx-balance.service';
import { QueryClientService } from 'cache/query-client.service';

let currentNetworkContainer: Container;

type NetworkSpecificContainers = Record<string, Container>;
const networkSpecificContainers: Partial<NetworkSpecificContainers> = {};

/**
 * Configures App Services DI containers
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
    // Network-specific containers
    for (const networkId of Object.keys(defaultNetworksKeyedById)) {
      const networkSpecificContainer = new Container();
      registerDependencies(
        networkSpecificContainer,
        {
          getConfig() {
            return (defaultNetworksKeyedById as any)[networkId];
          },
        },
        {} as QueryClientService
      );
      networkSpecificContainers[networkId] = networkSpecificContainer;
    }
  }
  return currentNetworkContainer;
}

function registerDependencies(
  container: Container,
  networkSettingsService: NetworkSettingsService,
  queryClientService: QueryClientService
) {
  // cache
  container.bind<QueryClientService>(TYPES.QueryClientService).toConstantValue(queryClientService);
  // settings
  container
    .bind<NetworkSettingsService>(TYPES.NetworkSettingsService)
    .toConstantValue(networkSettingsService);
  // api clients
  container
    .bind<BlockbookApiClient>(TYPES.BlockbookApiClient)
    .to(BlockbookApiClientImpl)
    .inSingletonScope();
  container
    .bind<MempoolSpaceApiClient>(TYPES.MempoolSpaceApiClient)
    .to(MempoolSpaceApiClientImpl)
    .inSingletonScope();
  // services
  container
    .bind<AccountBalanceService>(TYPES.AccountBalanceService)
    .to(AccountBalanceServiceImpl)
    .inSingletonScope();
  container
    .bind<BtcBalanceService>(TYPES.BtcBalanceService)
    .to(BtcBalanceServiceImpl)
    .inSingletonScope();
  container
    .bind<StxBalanceService>(TYPES.StxBalanceService)
    .to(StxBalanceServiceImpl)
    .inSingletonScope();
  container.bind<UtxoService>(TYPES.UtxoSerivce).to(UtxoServiceImpl).inSingletonScope();
}

function getContainer(networkId?: DefaultNetworkConfigurations): Container {
  if (!currentNetworkContainer) {
    throw new Error('Containers must be initialized before accessing');
  }
  return networkId ? networkSpecificContainers[networkId]! : currentNetworkContainer;
}

// Services API
export function getBtcBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getContainer(networkId).get<BtcBalanceService>(TYPES.BtcBalanceService);
}
export function getStxBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getContainer(networkId).get<StxBalanceService>(TYPES.StxBalanceService);
}
export function getAccountBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getContainer(networkId).get<AccountBalanceService>(TYPES.AccountBalanceService);
}
