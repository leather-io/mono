import { inject, injectable } from 'inversify';

import { OwnedUtxo } from '@leather.io/models';
import { hasBitcoinAddress } from '@leather.io/utils';

import { LeatherApiClient } from '../infrastructure/api/leather/leather-api.client';
import { MempoolApiClient } from '../infrastructure/api/mempool/mempool-api.client';
import { selectBitcoinNetworkMode } from '../infrastructure/settings/settings.selectors';
import type { SettingsService } from '../infrastructure/settings/settings.service';
import { Types } from '../inversify.types';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { AccountRequest } from '../types/request.types';
import {
  createOwnedUtxoFromLeather,
  createOwnedUtxoFromMempool,
  getUtxoTotals,
} from './utxos.utils';

export interface UtxoTotals {
  confirmed: OwnedUtxo[];
  inbound: OwnedUtxo[];
  outbound: OwnedUtxo[];
  dust: OwnedUtxo[];
  unspendable: OwnedUtxo[];
  available: OwnedUtxo[];
}

export const emptyUtxos: UtxoTotals = {
  confirmed: [],
  inbound: [],
  outbound: [],
  dust: [],
  unspendable: [],
  available: [],
};

const btcTxPageRequest = { page: 1, pageSize: 750 };

@injectable()
export class UtxosService {
  constructor(
    private readonly leatherApiClient: LeatherApiClient,
    private readonly mempoolApiClient: MempoolApiClient,
    private readonly bitcoinTransactionsService: BitcoinTransactionsService,
    @inject(Types.SettingsService) private readonly settings: SettingsService
  ) {}
  /**
   * Retrieve categorized UTXO lists for given Bitcoin account.
   */
  public async getAccountUtxos(
    { account, exclusions }: AccountRequest,
    signal?: AbortSignal
  ): Promise<UtxoTotals> {
    if (!hasBitcoinAddress(account)) return emptyUtxos;

    if (account.bitcoin.type === 'fixedAddress') {
      return this.getAddressUtxos(account.bitcoin.address, account.id.fingerprint, signal);
    }

    const [nativeSegwitUtxos, taprootUtxos] = await Promise.all([
      !exclusions?.nativeSegwitAddresses
        ? this.getDescriptorUtxos(
            account.id.fingerprint,
            account.bitcoin.nativeSegwitDescriptor,
            signal
          )
        : Promise.resolve(emptyUtxos),
      !exclusions?.taprootAddresses
        ? this.getDescriptorUtxos(account.id.fingerprint, account.bitcoin.taprootDescriptor, signal)
        : Promise.resolve(emptyUtxos),
    ]);
    return {
      confirmed: [...nativeSegwitUtxos.confirmed, ...taprootUtxos.confirmed],
      inbound: [...nativeSegwitUtxos.inbound, ...taprootUtxos.inbound],
      outbound: [...nativeSegwitUtxos.outbound, ...taprootUtxos.outbound],
      dust: [...nativeSegwitUtxos.dust, ...taprootUtxos.dust],
      unspendable: [...nativeSegwitUtxos.unspendable, ...taprootUtxos.unspendable],
      available: [...nativeSegwitUtxos.available, ...taprootUtxos.available],
    };
  }

  /**
   * Retrieve categorized UTXO lists for given Bitcoin xpub descriptor.
   */
  public async getDescriptorUtxos(
    fingerprint: string,
    descriptor: string,
    signal?: AbortSignal
  ): Promise<UtxoTotals> {
    const [totalUtxos, btcTxs] = await Promise.all([
      this.getDescriptorTotalUtxos(descriptor, fingerprint, signal),
      this.bitcoinTransactionsService.getDescriptorTransactions(
        descriptor,
        btcTxPageRequest,
        signal
      ),
    ]);
    return getUtxoTotals(fingerprint, totalUtxos, btcTxs);
  }

  private async getDescriptorTotalUtxos(
    descriptor: string,
    fingerprint: string,
    signal?: AbortSignal
  ): Promise<OwnedUtxo[]> {
    const networkMode = selectBitcoinNetworkMode(this.settings.getSettings());
    if (networkMode === 'regtest') {
      const mempoolApiUtxos = await this.mempoolApiClient.fetchDescriptorUtxos(descriptor, {
        signal,
      });
      return mempoolApiUtxos.map(utxo => createOwnedUtxoFromMempool(utxo, fingerprint));
    }
    const leatherApiUtxos = await this.leatherApiClient.fetchUtxos(descriptor, { signal });
    return leatherApiUtxos.map(utxo => createOwnedUtxoFromLeather(utxo, fingerprint));
  }

  public async getAddressUtxos(
    address: string,
    fingerprint: string,
    signal?: AbortSignal
  ): Promise<UtxoTotals> {
    const [totalUtxos, btcTxs] = await Promise.all([
      this.getAddressTotalUtxos(address, fingerprint, signal),
      this.bitcoinTransactionsService.getAddressTransactions(address, btcTxPageRequest, signal),
    ]);
    return getUtxoTotals(fingerprint, totalUtxos, btcTxs);
  }

  private async getAddressTotalUtxos(
    address: string,
    fingerprint: string,
    signal?: AbortSignal
  ): Promise<OwnedUtxo[]> {
    const leatherApiUtxos = await this.leatherApiClient.fetchUtxosByAddress(address, { signal });
    return leatherApiUtxos.map(utxo => createOwnedUtxoFromLeather(utxo, fingerprint));
  }
}
