import axios, { AxiosError } from 'axios';
import { inject } from 'inversify';

import { deriveAddressesFromDescriptor } from '@leather.io/bitcoin';

import { Types } from '../../../inversify.types';
import { HttpCacheService } from '../../cache/http-cache.service';
import { selectBitcoinNetworkMode } from '../../settings/settings.selectors';
import type { SettingsService } from '../../settings/settings.service';
import { ApiRequestOptions } from '../types';
import {
  MempoolDescriptorTransaction,
  MempoolDescriptorUtxo,
  MempoolTransaction,
  MempoolUtxo,
  mempoolTransactionSchema,
  mempoolUtxoSchema,
} from './mempool-api.schema';
import { getMempoolUrlFromUserSettings } from './mempool-api.utils';

export class MempoolApiClient {
  constructor(
    @inject(Types.CacheService) private readonly cache: HttpCacheService,
    @inject(Types.SettingsService) private readonly settings: SettingsService
  ) {}

  public async fetchDescriptorTransactions(
    descriptor: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<MempoolDescriptorTransaction[]> {
    const mempoolUrl = getMempoolUrlFromUserSettings(this.settings.getSettings());
    if (!mempoolUrl) {
      return [];
    }
    const addresses = deriveAddressesFromDescriptor({
      accountDescriptor: descriptor,
      network: selectBitcoinNetworkMode(this.settings.getSettings()),
      limit: 3,
    });
    const results = await Promise.all(
      addresses.map(address =>
        this.fetchAddressTransactions(address.address, mempoolUrl, { signal, skipCache })
      )
    );
    return results.flatMap((addressTxs, index) =>
      addressTxs.map(tx => ({
        ...tx,
        address: addresses[index].address,
        path: addresses[index].path,
      }))
    );
  }

  public async fetchDescriptorUtxos(
    descriptor: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<MempoolDescriptorUtxo[]> {
    const mempoolUrl = getMempoolUrlFromUserSettings(this.settings.getSettings());
    if (!mempoolUrl) {
      return [];
    }
    const addresses = deriveAddressesFromDescriptor({
      accountDescriptor: descriptor,
      network: selectBitcoinNetworkMode(this.settings.getSettings()),
      limit: 3,
    });
    const results = await Promise.all(
      addresses.map(address =>
        this.fetchAddressUtxos(address.address, mempoolUrl, { signal, skipCache })
      )
    );
    return results.flatMap((addressUtxos, index) =>
      addressUtxos.map(utxo => ({
        ...utxo,
        address: addresses[index].address,
        path: addresses[index].path,
      }))
    );
  }

  public async fetchAddressUtxos(
    address: string,
    mempoolUrl?: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<MempoolUtxo[]> {
    const fetchFn = async () => {
      const { data } = await axios.get<MempoolUtxo[]>(
        `${mempoolUrl ?? getMempoolUrlFromUserSettings(this.settings.getSettings())}/address/${address}/utxo`,
        {
          signal,
        }
      );
      return mempoolUtxoSchema.array().parse(data);
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['mempool-api-address-utxos', address], fetchFn);
  }

  public async fetchAddressTransactions(
    address: string,
    mempoolUrl?: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<MempoolTransaction[]> {
    const network = this.settings.getSettings().network.chain.bitcoin.bitcoinNetwork;
    if (network !== 'regtest') {
      throw new Error('Mempool API is only supported on regtest');
    }
    const fetchFn = async () => {
      const { data } = await axios.get<MempoolTransaction[]>(
        `${mempoolUrl ?? getMempoolUrlFromUserSettings(this.settings.getSettings())}/address/${address}/txs`,
        { signal }
      );
      return mempoolTransactionSchema.array().parse(data);
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['mempool-api-address-transactions', address], fetchFn);
  }

  public async fetchTransactionByTxId(
    txid: string,
    mempoolUrl?: string,
    { signal, skipCache }: ApiRequestOptions = {}
  ): Promise<MempoolTransaction | null> {
    const fetchFn = async () => {
      try {
        const { data } = await axios.get<MempoolTransaction>(
          `${mempoolUrl ?? getMempoolUrlFromUserSettings(this.settings.getSettings())}/tx/${txid}`,
          { signal }
        );
        return mempoolTransactionSchema.parse(data);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    };
    return skipCache
      ? await fetchFn()
      : await this.cache.fetchWithCache(['mempool-api-transaction-by-txid', txid], fetchFn);
  }
}
