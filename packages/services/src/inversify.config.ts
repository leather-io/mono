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

let defaultContainer: Container;

type NetworkSpecificContainers = Record<DefaultNetworkConfigurations, Container>;
const networkContainers: Partial<NetworkSpecificContainers> = {};

/**
 * Configures and returns the default App Services DI container.
 */
export function configureDefaultServicesContainer(
  defaultNetworkSettingsService: NetworkSettingsService
): Container {
  if (!defaultContainer) {
    defaultContainer = new Container();
    registerDependencies(defaultContainer, defaultNetworkSettingsService);
  }
  return defaultContainer;
}

/**
 * Returns App Services DI Container. Defaults to current
 * user settings. Optionally return a network-specific container.
 */
export function getServicesContainer(networkId?: DefaultNetworkConfigurations): Container {
  if (!defaultContainer)
    throw new Error('Default DI Container must be initialized before requesting Container');
  if (!networkId) {
    return defaultContainer;
  }
  if (!networkContainers[networkId]) {
    const networkSpecificContainer = new Container();
    registerDependencies(networkSpecificContainer, {
      getConfig() {
        return (defaultNetworksKeyedById as any)[networkId];
      },
    });
    networkContainers[networkId] = networkSpecificContainer;
  }
  return networkContainers[networkId];
}

function registerDependencies(
  container: Container,
  networkSettingsService: NetworkSettingsService
) {
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
