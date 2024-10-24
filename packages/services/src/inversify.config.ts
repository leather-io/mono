import { Container } from 'inversify';

import { DefaultNetworkConfigurations, defaultNetworksKeyedById } from '@leather.io/models';

import { BlockbookApiClient, createBlockbookApiClient } from './api/blockbook/blockbook.client';
import {
  MempoolSpaceApiClient,
  createMempoolSpaceApiClient,
} from './api/mempool-space/mempool-space.client';
import {
  AccountBalanceService,
  createAccountBalanceService,
} from './balances/account-balance.service';
import { BtcBalanceService, createBtcBalanceService } from './balances/bitcoin/btc-balance.service';
import { StxBalanceService, createStxBalanceService } from './balances/stacks/stx-balance.service';
import { QueryClientService } from './cache/query-client.service';
import { NetworkSettingsService } from './settings/network-settings.service';
import { UtxoService, createUtxoService } from './utxos/utxo.service';

// Symbols for Service Bindings
const Services = {
  QueryClientService: Symbol.for('QueryClientService'),
  NetworkSettingsService: Symbol.for('NetworkSettingsService'),
  BlockbookApiClient: Symbol.for('BlockbookApiClient'),
  MempoolSpaceApiClient: Symbol.for('MempoolSpaceApiClient'),
  AccountBalanceService: Symbol.for('AccountBalanceService'),
  BtcBalanceService: Symbol.for('BtcBalanceService'),
  StxBalanceService: Symbol.for('StxBalanceService'),
  UtxoService: Symbol.for('UtxoService'),
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
    .bind<BlockbookApiClient>(Services.BlockbookApiClient)
    .toDynamicValue(c =>
      createBlockbookApiClient(
        c.container.get(Services.NetworkSettingsService),
        c.container.get(Services.QueryClientService)
      )
    )
    .inSingletonScope();
  container
    .bind<MempoolSpaceApiClient>(Services.MempoolSpaceApiClient)
    .toDynamicValue(c =>
      createMempoolSpaceApiClient(
        c.container.get<NetworkSettingsService>(Services.NetworkSettingsService)
      )
    )
    .inSingletonScope();
  container
    .bind<AccountBalanceService>(Services.AccountBalanceService)
    .toDynamicValue(c =>
      createAccountBalanceService(
        c.container.get<BtcBalanceService>(Services.BtcBalanceService),
        c.container.get<StxBalanceService>(Services.StxBalanceService)
      )
    )
    .inSingletonScope();
  container
    .bind<BtcBalanceService>(Services.BtcBalanceService)
    .toDynamicValue(c =>
      createBtcBalanceService(
        c.container.get<BlockbookApiClient>(Services.BlockbookApiClient),
        c.container.get<UtxoService>(Services.UtxoService)
      )
    )
    .inSingletonScope();
  container
    .bind<StxBalanceService>(Services.StxBalanceService)
    .toDynamicValue(c =>
      createStxBalanceService(
        c.container.get<MempoolSpaceApiClient>(Services.MempoolSpaceApiClient)
      )
    )
    .inSingletonScope();
  container
    .bind<UtxoService>(Services.UtxoService)
    .toDynamicValue(c =>
      createUtxoService(
        c.container.get<NetworkSettingsService>(Services.NetworkSettingsService),
        c.container.get<MempoolSpaceApiClient>(Services.MempoolSpaceApiClient),
        c.container.get<BlockbookApiClient>(Services.BlockbookApiClient)
      )
    )
    .inSingletonScope();
}

// Exported Services API
export function getBtcBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getContainer(networkId).get<BtcBalanceService>(Services.BtcBalanceService);
}
export function getStxBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getContainer(networkId).get<StxBalanceService>(Services.StxBalanceService);
}
export function getAccountBalanceService(networkId?: DefaultNetworkConfigurations) {
  return getContainer(networkId).get<AccountBalanceService>(Services.AccountBalanceService);
}
