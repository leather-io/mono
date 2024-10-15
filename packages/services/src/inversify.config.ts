import { BlockbookClient } from 'api/providers/blockbook-client';
import { MempoolClient } from 'api/providers/mempool-client';
import { BitcoinBalanceService } from 'balance/bitcoin/bitcoin-balance.service';
import { Container } from 'inversify';
import 'reflect-metadata';
import { UtxoService } from 'utxos/utxo.service';

let container: Container;

export function configureContainer(config: Record<string, any>) {
  if (!container) {
    container = new Container();
    config; // temporary disable eslint warning
    // api clients
    container.bind<BlockbookClient>(BlockbookClient).toSelf();
    container.bind<MempoolClient>(MempoolClient).toSelf();
    // services
    container.bind<BitcoinBalanceService>(BitcoinBalanceService).toSelf();
    container.bind<UtxoService>(UtxoService).toSelf();
  }
  return container;
}
